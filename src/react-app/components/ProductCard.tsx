import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/shared/types';
import BuyNowButton from './BuyNowButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
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
        // You could add a toast notification here
        console.log('Added to cart successfully');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square mb-4">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        
        {/* Overlay actions */}
        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center gap-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="bg-white text-black p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button className="bg-white text-black p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Price badge */}
        <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full font-semibold text-sm">
          ₹{product.price}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-black transition-colors">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-black">
            ₹{product.price}
          </span>
          
          {sizes.length > 0 && (
            <div className="flex gap-1">
              {sizes.slice(0, 3).map((size: string) => (
                <span key={size} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {size}
                </span>
              ))}
              {sizes.length > 3 && (
                <span className="text-xs text-gray-500">+{sizes.length - 3}</span>
              )}
            </div>
          )}
        </div>
        
        {colors.length > 0 && (
          <div className="flex gap-2 mt-2">
            {colors.slice(0, 4).map((color: string) => (
              <div
                key={color}
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-xs text-gray-500 self-center">+{colors.length - 4}</span>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-3 mt-4">
          <BuyNowButton 
            product={product} 
            selectedSize={sizes.length > 0 ? sizes[0] : undefined}
            selectedColor={colors.length > 0 ? colors[0] : undefined}
            quantity={1}
          />
          
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
          >
            <ShoppingCart className={`w-4 h-4 ${isAddingToCart ? 'animate-spin' : ''}`} />
            <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
