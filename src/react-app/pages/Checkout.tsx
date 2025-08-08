import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { CreditCard, MapPin, Phone } from 'lucide-react';
import Navbar from '@/react-app/components/Navbar';
import { CartItem } from '@/shared/types';

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formData, setFormData] = useState({
    shipping_address: '',
    billing_address: '',
    phone: '',
    use_same_address: true,
  });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          shipping_address: formData.shipping_address,
          billing_address: formData.use_same_address ? formData.shipping_address : formData.billing_address,
          phone: formData.phone,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/orders?success=true&order_id=${result.orderId}`);
      } else {
        const error = await response.json();
        console.error('Order failed:', error);
      }
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  const shipping = subtotal > 2000 ? 0 : 199;
  const total = subtotal + shipping;

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to checkout</h2>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products before checking out</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Shipping Address */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              <textarea
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleInputChange}
                placeholder="Enter your full shipping address"
                required
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Billing Address */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Billing Address</h2>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="use_same_address"
                    checked={formData.use_same_address}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Same as shipping</span>
                </label>
              </div>
              
              {!formData.use_same_address && (
                <textarea
                  name="billing_address"
                  value={formData.billing_address}
                  onChange={handleInputChange}
                  placeholder="Enter your billing address"
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              )}
            </div>

            {/* Phone Number */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Phone Number</h2>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Your phone number"
                required
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop&crop=center'}
                      alt={item.name || 'Product'}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <div className="text-xs text-gray-600">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span> • </span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-medium">₹{((item.price || 0) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="space-y-3 mb-6 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isPlacingOrder}
                className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
