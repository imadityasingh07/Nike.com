import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Navbar from '@/react-app/components/Navbar';
import { CartItem } from '@/shared/types';

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      redirectToLogin();
      return;
    }

    fetchCartItems();
  }, [user, redirectToLogin]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const items = await response.json();
        setCartItems(items);
      }
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Update locally first for immediate feedback
    setCartItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    try {
      // Note: We'd need to add a PUT endpoint for updating cart items
      // For now, we'll remove and re-add the item
      await removeFromCart(itemId);
      
      const item = cartItems.find(item => item.id === itemId);
      if (item) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            product_id: item.product_id,
            quantity: newQuantity,
            size: item.size,
            color: item.color,
          }),
        });
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      fetchCartItems(); // Refresh to get correct state
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setCartItems(items => items.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign in to view your cart</h2>
          <button
            onClick={redirectToLogin}
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 p-6 border border-gray-200 rounded-lg">
                <div className="bg-gray-200 w-24 h-24 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started</p>
            <Link
              to="/products"
              className="inline-flex items-center bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-6 border border-gray-200 rounded-lg">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop&crop=center'}
                    alt={item.name || 'Product'}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      {item.size && <div>Size: {item.size}</div>}
                      {item.color && <div>Color: {item.color}</div>}
                    </div>
                    <div className="text-lg font-semibold mt-2">₹{item.price}</div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-8 lg:mt-0">
              <div className="bg-gray-50 p-6 rounded-lg sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{total > 2000 ? 'Free' : '₹199'}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{(total + (total > 2000 ? 0 : 199)).toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                >
                  Proceed to Checkout
                </button>
                
                <Link
                  to="/products"
                  className="block text-center text-black font-medium mt-4 hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
