import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@getmocha/users-service/react';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { Product } from '@/shared/types';
import BuyNowButton from './BuyNowButton';

interface AnimatedProductCardProps {
  product: Product;
}

export default function AnimatedProductCard({ product }: AnimatedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { user, redirectToLogin } = useAuth();

  const sizes = product.sizes ? JSON.parse(product.sizes) : [];
  const colors = product.colors ? JSON.parse(product.colors) : [];

  const handleAddToCart = async () => {
    if (!user) {
      redirectToLogin();
      return;
    }

    setIsAddingToCart(true);
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          size: sizes.length > 0 ? sizes[0] : undefined,
          color: colors.length > 0 ? colors[0] : undefined,
        }),
      });

      if (response.ok) {
        // Success animation could be added here
        console.log('Added to cart successfully');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const cardVariants = {
    initial: {
      scale: 1,
      rotateY: 0,
      rotateX: 0,
    },
    hover: {
      scale: 1.05,
      rotateY: 10,
      rotateX: 5,
    }
  };

  const imageVariants = {
    initial: {
      scale: 1,
      filter: "brightness(1)",
    },
    hover: {
      scale: 1.1,
      filter: "brightness(1.1)",
    }
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      }
    }
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      }
    }
  };

  return (
    <motion.div 
      className="group cursor-pointer transform-3d"
      initial="initial"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      variants={cardVariants}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ perspective: 1000 }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
        {/* Main Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center'}
            alt={product.name}
            className="w-full h-full object-cover"
            variants={imageVariants}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Floating Action Buttons */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center gap-4"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  variants={buttonVariants}
                  whileTap="tap"
                  className="glass backdrop-blur-sm bg-white/20 text-white p-4 rounded-full hover:bg-white/30 transition-all duration-300 disabled:opacity-50 group/btn"
                >
                  <motion.div
                    animate={isAddingToCart ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 0.5, repeat: isAddingToCart ? Infinity : 0 }}
                  >
                    <ShoppingCart className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                  </motion.div>
                </motion.button>
                
                <motion.button
                  onClick={() => setIsLiked(!isLiked)}
                  variants={buttonVariants}
                  whileTap="tap"
                  className="glass backdrop-blur-sm bg-white/20 text-white p-4 rounded-full hover:bg-white/30 transition-all duration-300 group/btn"
                >
                  <Heart className={`w-6 h-6 group-hover/btn:scale-110 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </motion.button>
                
                <motion.button
                  variants={buttonVariants}
                  whileTap="tap"
                  className="glass backdrop-blur-sm bg-white/20 text-white p-4 rounded-full hover:bg-white/30 transition-all duration-300 group/btn"
                >
                  <Eye className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price Badge with Animation */}
          <motion.div 
            className="absolute top-4 left-4 glass-dark backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ₹{product.price}
          </motion.div>

          {/* Featured Badge */}
          {product.is_featured && (
            <motion.div 
              className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(251, 191, 36, 0)",
                  "0 0 0 10px rgba(251, 191, 36, 0)",
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            >
              <Star className="w-3 h-3 fill-current" />
              Featured
            </motion.div>
          )}
        </div>
        
        {/* Product Details */}
        <motion.div 
          className="p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.h3 
            className="font-bold text-xl text-gray-900 group-hover:gradient-text transition-all duration-300"
            whileHover={{ scale: 1.02 }}
          >
            {product.name}
          </motion.h3>
          
          {product.description && (
            <motion.p 
              className="text-gray-600 text-sm line-clamp-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {product.description}
            </motion.p>
          )}
          
          <div className="flex items-center justify-between">
            <motion.span 
              className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              ₹{product.price}
            </motion.span>
            
            {sizes.length > 0 && (
              <div className="flex gap-1">
                {sizes.slice(0, 3).map((size: string, index: number) => (
                  <motion.span 
                    key={size}
                    className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.1, backgroundColor: "#e5e7eb" }}
                  >
                    {size}
                  </motion.span>
                ))}
                {sizes.length > 3 && (
                  <span className="text-xs text-gray-500">+{sizes.length - 3}</span>
                )}
              </div>
            )}
          </div>
          
          {colors.length > 0 && (
            <div className="flex gap-2 pt-2">
              {colors.slice(0, 4).map((color: string, index: number) => (
                <motion.div
                  key={color}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.2, 
                    borderColor: "#667eea",
                    boxShadow: "0 0 15px rgba(102, 126, 234, 0.5)"
                  }}
                />
              ))}
              {colors.length > 4 && (
                <span className="text-xs text-gray-500 self-center">+{colors.length - 4}</span>
              )}
            </div>
          )}
          
          {/* Buy Now Button */}
          <motion.div 
            className="mt-4 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <BuyNowButton 
              product={product} 
              selectedSize={sizes.length > 0 ? sizes[0] : undefined}
              selectedColor={colors.length > 0 ? colors[0] : undefined}
              quantity={1}
            />
            
            {/* Quick Add to Cart */}
            <motion.button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={isAddingToCart ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.5, repeat: isAddingToCart ? Infinity : 0 }}
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.div>
              <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Hover Effect Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </motion.div>
  );
}
