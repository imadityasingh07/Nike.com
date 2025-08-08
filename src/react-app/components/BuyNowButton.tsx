import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@getmocha/users-service/react';
import { CreditCard, Lock, Zap } from 'lucide-react';
import { Product } from '@/shared/types';

interface BuyNowButtonProps {
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  quantity?: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BuyNowButton({ 
  product, 
  selectedSize, 
  selectedColor, 
  quantity = 1 
}: BuyNowButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, redirectToLogin } = useAuth();

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleBuyNow = async () => {
    if (!user) {
      redirectToLogin();
      return;
    }

    setIsProcessing(true);

    try {
      // Load Razorpay script
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          size: selectedSize,
          color: selectedColor,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay payment
      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: 'INR',
        name: 'StepForward',
        description: `Purchase: ${product.name}`,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop&crop=center',
        order_id: orderData.razorpay_order_id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.order_id,
              }),
            });

            if (verifyResponse.ok) {
              const result = await verifyResponse.json();
              // Redirect to success page
              window.location.href = `/orders?success=true&order_id=${result.order_id}&payment_id=${response.razorpay_payment_id}`;
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.google_user_data.name || '',
          email: user.google_user_data.email || '',
        },
        notes: {
          product_id: product.id.toString(),
          size: selectedSize || '',
          color: selectedColor || '',
        },
        theme: {
          color: '#667eea',
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <motion.button
      onClick={handleBuyNow}
      disabled={isProcessing}
      className="group relative w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"
        initial={{ x: '-100%' }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -top-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse" />
      
      <div className="relative flex items-center justify-center gap-3">
        {isProcessing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              <CreditCard className="w-5 h-5" />
            </motion.div>
            <span className="text-lg">Buy Now - ₹{(product.price * quantity).toFixed(2)}</span>
            <Lock className="w-4 h-4 opacity-75" />
          </>
        )}
      </div>
      
      {/* Security badge */}
      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        Secure
      </div>
    </motion.button>
  );
}
