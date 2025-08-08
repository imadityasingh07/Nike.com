import { Hono } from "hono";
import { cors } from "hono/cors";
import { 
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import Razorpay from "razorpay";
interface Env {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors({
  origin: ["http://localhost:5173"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Auth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Products endpoints
app.get('/api/products', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM products ORDER BY created_at DESC"
  ).all();
  
  return c.json(results);
});

app.get('/api/products/featured', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM products WHERE is_featured = 1 ORDER BY created_at DESC LIMIT 6"
  ).all();
  
  return c.json(results);
});

// Cart endpoints
const addToCartSchema = z.object({
  product_id: z.number(),
  quantity: z.number().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

app.get('/api/cart', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }
  
  const { results } = await c.env.DB.prepare(`
    SELECT ci.*, p.name, p.price, p.image_url 
    FROM cart_items ci 
    JOIN products p ON ci.product_id = p.id 
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `).bind(user.id).all();
  
  return c.json(results);
});

app.post('/api/cart', authMiddleware, zValidator('json', addToCartSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }
  const { product_id, quantity, size, color } = c.req.valid('json');
  
  // Check if item already exists in cart
  const existingItem = await c.env.DB.prepare(
    "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?"
  ).bind(user.id, product_id, size || '', color || '').first();
  
  if (existingItem) {
    // Update quantity
    await c.env.DB.prepare(
      "UPDATE cart_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(quantity, existingItem.id).run();
  } else {
    // Add new item
    await c.env.DB.prepare(
      "INSERT INTO cart_items (user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)"
    ).bind(user.id, product_id, quantity, size || '', color || '').run();
  }
  
  return c.json({ success: true });
});

app.delete('/api/cart/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }
  const itemId = c.req.param('id');
  
  await c.env.DB.prepare(
    "DELETE FROM cart_items WHERE id = ? AND user_id = ?"
  ).bind(itemId, user.id).run();
  
  return c.json({ success: true });
});

// Orders endpoint
const createOrderSchema = z.object({
  shipping_address: z.string(),
  billing_address: z.string().optional(),
  phone: z.string(),
});

app.post('/api/orders', authMiddleware, zValidator('json', createOrderSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }
  const { shipping_address, billing_address, phone } = c.req.valid('json');
  
  // Get cart items
  const { results: cartItems } = await c.env.DB.prepare(`
    SELECT ci.*, p.name, p.price 
    FROM cart_items ci 
    JOIN products p ON ci.product_id = p.id 
    WHERE ci.user_id = ?
  `).bind(user.id).all();
  
  if (cartItems.length === 0) {
    return c.json({ error: 'Cart is empty' }, 400);
  }
  
  // Calculate total
  const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  
  // Create order
  const orderResult = await c.env.DB.prepare(
    "INSERT INTO orders (user_id, total_amount, shipping_address, billing_address, phone, order_items) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(
    user.id, 
    total, 
    shipping_address, 
    billing_address || shipping_address, 
    phone, 
    JSON.stringify(cartItems)
  ).run();
  
  // Clear cart
  await c.env.DB.prepare("DELETE FROM cart_items WHERE user_id = ?").bind(user.id).run();
  
  return c.json({ orderId: orderResult.meta?.last_row_id, total });
});

app.get('/api/orders', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(user.id).all();
  
  return c.json(results);
});

// Payment endpoints
const createPaymentOrderSchema = z.object({
  product_id: z.number(),
  quantity: z.number().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

app.post('/api/payment/create-order', authMiddleware, zValidator('json', createPaymentOrderSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }
  
  const { product_id, quantity, size, color } = c.req.valid('json');
  
  try {
    // Get product details
    const product = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(product_id).first() as any;
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Calculate total
    const subtotal = (product.price as number) * quantity;
    const shipping = subtotal > 2000 ? 0 : 199;
    const total = subtotal + shipping;
    const totalInPaise = Math.round(total * 100); // Convert to paise for Razorpay
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: c.env.RAZORPAY_KEY_ID,
      key_secret: c.env.RAZORPAY_KEY_SECRET,
    });
    
    // Create order in database first
    const orderResult = await c.env.DB.prepare(`
      INSERT INTO orders (user_id, total_amount, shipping_address, phone, order_items, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      user.id, 
      total, 
      'Pending - to be updated after payment',
      'Pending - to be updated after payment',
      JSON.stringify([{
        product_id,
        product_name: product.name,
        quantity,
        size: size || null,
        color: color || null,
        price: product.price as number as number
      }]),
      'pending_payment'
    ).run();
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalInPaise,
      currency: 'INR',
      receipt: `order_${orderResult.meta?.last_row_id}`,
      notes: {
        order_id: orderResult.meta?.last_row_id?.toString() || '',
        user_id: user.id,
        product_id: product_id.toString(),
      }
    });
    
    return c.json({
      razorpay_order_id: razorpayOrder.id,
      razorpay_key_id: c.env.RAZORPAY_KEY_ID,
      amount: totalInPaise,
      currency: 'INR',
      order_id: orderResult.meta?.last_row_id,
      product_name: product.name,
    });
    
  } catch (error) {
    console.error('Payment order creation error:', error);
    return c.json({ error: 'Failed to create payment order' }, 500);
  }
});

const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
  order_id: z.number(),
});

app.post('/api/payment/verify', authMiddleware, zValidator('json', verifyPaymentSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }
  
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id } = c.req.valid('json');
  
  try {
    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(c.env.RAZORPAY_KEY_SECRET);
    const message = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, message);
    const generated_signature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (generated_signature !== razorpay_signature) {
      return c.json({ error: 'Invalid payment signature' }, 400);
    }
    
    // Initialize Razorpay to fetch payment details
    const razorpay = new Razorpay({
      key_id: c.env.RAZORPAY_KEY_ID,
      key_secret: c.env.RAZORPAY_KEY_SECRET,
    });
    
    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status === 'captured') {
      // Update order status to completed
      await c.env.DB.prepare(`
        UPDATE orders 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `).bind('completed', order_id, user.id).run();
      
      // Store payment details
      await c.env.DB.prepare(`
        INSERT INTO payment_transactions (order_id, razorpay_payment_id, razorpay_order_id, amount, status, payment_method)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        order_id,
        razorpay_payment_id,
        razorpay_order_id,
        (payment.amount as number) / 100, // Convert back from paise
        payment.status,
        payment.method || 'unknown'
      ).run();
      
      return c.json({ 
        success: true, 
        order_id,
        payment_id: razorpay_payment_id,
        status: 'completed'
      });
    } else {
      return c.json({ error: 'Payment not successful' }, 400);
    }
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return c.json({ error: 'Payment verification failed' }, 500);
  }
});

// Buy now checkout endpoint
const buyNowCheckoutSchema = z.object({
  product_id: z.number(),
  quantity: z.number().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
  shipping_address: z.string(),
  phone: z.string(),
});

app.post('/api/buy-now/checkout', authMiddleware, zValidator('json', buyNowCheckoutSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }
  
  const { product_id, quantity, size, color, shipping_address, phone } = c.req.valid('json');
  
  try {
    // Get product details
    const product = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(product_id).first() as any;
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Calculate total  
    const subtotal = (product.price as number) * quantity;
    const shipping = subtotal > 2000 ? 0 : 199;
    const total = subtotal + shipping;
    
    // Create order
    const orderResult = await c.env.DB.prepare(`
      INSERT INTO orders (user_id, total_amount, shipping_address, phone, order_items, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      user.id, 
      total, 
      shipping_address,
      phone,
      JSON.stringify([{
        product_id,
        product_name: product.name,
        quantity,
        size: size || null,
        color: color || null,
        price: product.price
      }]),
      'completed'
    ).run();
    
    return c.json({ 
      success: true, 
      order_id: orderResult.meta?.last_row_id,
      total 
    });
    
  } catch (error) {
    console.error('Buy now checkout error:', error);
    return c.json({ error: 'Failed to process purchase' }, 500);
  }
});

export default app;
