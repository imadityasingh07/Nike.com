import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, Lock, CheckCircle } from 'lucide-react';
import { Product } from '@/shared/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  product,
  selectedSize,
  selectedColor,
  quantity
}: PaymentModalProps) {
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');

  const total = product.price * quantity;
  const shipping = total > 2000 ? 0 : 199;
  const finalTotal = total + shipping;

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 100,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 100,
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl mx-4 bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 500,
              duration: 0.3
            }}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-100">
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
              
              <div className="pr-12">
                <motion.h2 
                  className="text-2xl font-bold gradient-text mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Complete Your Purchase
                </motion.h2>
                <motion.p 
                  className="text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Secure payment powered by Razorpay
                </motion.p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Summary */}
              <motion.div 
                className="flex gap-4 p-4 bg-gray-50 rounded-2xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop&crop=center'}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Qty: {quantity}</span>
                    {selectedSize && <span>Size: {selectedSize}</span>}
                    {selectedColor && <span>Color: {selectedColor}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{product.price.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">per item</div>
                </div>
              </motion.div>

              {/* Shipping Details */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Shipping Information
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Address *
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter your complete address"
                      required
                      rows={3}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Order Summary */}
              <motion.div 
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="font-semibold text-lg mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({quantity} items)</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Security Features */}
              <motion.div 
                className="flex items-center justify-center gap-6 p-4 bg-green-50 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2 text-green-700">
                  <Lock className="w-5 h-5" />
                  <span className="text-sm font-medium">SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Protected</span>
                </div>
              </motion.div>

              {/* Payment Button */}
              <motion.button
                onClick={() => {/* Will be handled by BuyNowButton */}}
                disabled={!shippingAddress || !phone}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <CreditCard className="w-6 h-6 group-hover:animate-pulse" />
                  <span className="text-lg">
                    Pay ₹{finalTotal.toFixed(2)}
                  </span>
                </div>
              </motion.button>

              {/* Payment Methods */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-sm text-gray-500 mb-3">We accept all major payment methods</p>
                <div className="flex items-center justify-center gap-4 opacity-75">
                  <img src="https://logos-world.net/wp-content/uploads/2020/09/Visa-Logo.png" alt="Visa" className="h-6" />
                  <img src="https://logos-world.net/wp-content/uploads/2020/09/Mastercard-Logo.png" alt="Mastercard" className="h-6" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Rupay-Logo.png/512px-Rupay-Logo.png" alt="RuPay" className="h-6" />
                  <span className="text-xs text-gray-400">+ UPI, Net Banking, Wallets</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
