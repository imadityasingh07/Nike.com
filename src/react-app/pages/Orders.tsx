import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useSearchParams } from 'react-router';
import { Package, CheckCircle, Clock, Truck } from 'lucide-react';
import Navbar from '@/react-app/components/Navbar';
import { Order } from '@/shared/types';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, redirectToLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!user) {
      redirectToLogin();
      return;
    }

    fetchOrders();
  }, [user, redirectToLogin]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign in to view your orders</h2>
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
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

        {/* Success Message */}
        {success && orderId && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Order placed successfully!</h3>
                <p className="text-green-700">Order #{orderId} has been confirmed and will be processed shortly.</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-6 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-5 rounded w-32"></div>
                    <div className="bg-gray-200 h-4 rounded w-24"></div>
                  </div>
                  <div className="bg-gray-200 h-6 rounded w-20"></div>
                </div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="flex gap-3">
                      <div className="bg-gray-200 w-16 h-16 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">When you place an order, it will appear here</p>
            <button
              onClick={() => window.location.href = '/products'}
              className="inline-flex items-center bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderItems = JSON.parse(order.order_items);
              const orderDate = new Date(order.created_at).toLocaleDateString();
              
              return (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                      <p className="text-gray-600 text-sm">Placed on {orderDate}</p>
                      <p className="text-gray-600 text-sm">Total: ₹{order.total_amount.toFixed(2)}</p>
                    </div>
                    
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    {orderItems.map((item: any, index: number) => (
                      <div key={index} className="flex gap-4">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop&crop=center'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="text-sm text-gray-600">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.size && item.color && <span> • </span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity} • ₹{item.price} each
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-line">{order.shipping_address}</p>
                    {order.phone && (
                      <p className="text-gray-600 text-sm mt-1">Phone: {order.phone}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
