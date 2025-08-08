import z from "zod";

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  image_url: z.string().nullable(),
  category: z.string().nullable(),
  sizes: z.string().nullable(), // JSON string
  colors: z.string().nullable(), // JSON string
  stock_quantity: z.number(),
  is_featured: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CartItemSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  product_id: z.number(),
  quantity: z.number(),
  size: z.string().nullable(),
  color: z.string().nullable(),
  name: z.string().optional(),
  price: z.number().optional(),
  image_url: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const OrderSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  total_amount: z.number(),
  status: z.string(),
  shipping_address: z.string(),
  billing_address: z.string().nullable(),
  phone: z.string().nullable(),
  order_items: z.string(), // JSON string
  created_at: z.string(),
  updated_at: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type Order = z.infer<typeof OrderSchema>;

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CreateOrderRequest {
  shipping_address: string;
  billing_address?: string;
  phone: string;
}
