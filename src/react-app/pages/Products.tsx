import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import AnimatedNavbar from '@/react-app/components/AnimatedNavbar';
import AnimatedProductCard from '@/react-app/components/AnimatedProductCard';
import { Product } from '@/shared/types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, sortBy]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter((cat): cat is string => Boolean(cat))))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      <AnimatedNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 gradient-text">All Products</h1>
          <p className="text-gray-600">Discover our complete collection</p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between glass backdrop-blur-sm rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <motion.div 
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-72 glass backdrop-blur-sm"
              />
            </motion.div>

            {/* Category Filter */}
            <motion.select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent glass backdrop-blur-sm font-medium"
              whileHover={{ scale: 1.02 }}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </motion.select>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-blue-500" />
              <motion.select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-2xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent glass backdrop-blur-sm font-medium"
                whileHover={{ scale: 1.02 }}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </motion.select>
            </div>

            <motion.div 
              className="text-sm text-gray-500 font-medium px-4 py-2 glass backdrop-blur-sm rounded-xl"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {filteredProducts.length} products
            </motion.div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={i}
                className="animate-pulse"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="skeleton aspect-square rounded-3xl mb-4"></div>
                <div className="space-y-2">
                  <div className="skeleton h-4 rounded w-3/4"></div>
                  <div className="skeleton h-4 rounded w-1/2"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.05, 
                  duration: 0.6,
                  ease: "easeOut"
                }}
              >
                <AnimatedProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h3 
              className="text-2xl font-bold text-gray-900 mb-2 gradient-text"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              No products found
            </motion.h3>
            <p className="text-gray-600 text-lg">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
