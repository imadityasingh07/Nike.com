import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@getmocha/users-service/react';
import { Menu, ShoppingCart, User, X, Search } from 'lucide-react';

export default function AnimatedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, redirectToLogin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  const logoVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        yoyo: Infinity
      }
    }
  };

  return (
    <motion.nav 
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'glass backdrop-blur-xl border-b border-white/10' 
          : 'bg-white'
      }`}
      variants={navVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Animation */}
          <Link to="/" className="flex-shrink-0">
            <motion.span 
              className="text-2xl font-black gradient-text"
              variants={logoVariants}
              initial="initial"
              whileHover="hover"
            >
              StepForward
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-black font-semibold transition-all duration-300 relative group"
              >
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/cart" 
                className="flex items-center space-x-2 text-gray-700 hover:text-black transition-all duration-300 relative group"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                >
                  <ShoppingCart size={20} />
                </motion.div>
                <span>Cart</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/orders" 
                    className="text-gray-700 hover:text-black font-semibold transition-all duration-300 relative group"
                  >
                    Orders
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
                
                <div className="relative group">
                  <motion.button 
                    className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {user.google_user_data.picture ? (
                      <motion.img 
                        src={user.google_user_data.picture} 
                        alt={user.google_user_data.name || 'User'} 
                        className="w-8 h-8 rounded-full border-2 border-transparent hover:border-blue-500 transition-all"
                        whileHover={{ borderColor: "#667eea" }}
                      />
                    ) : (
                      <User size={20} />
                    )}
                    <span className="hidden lg:block font-medium">{user.google_user_data.given_name}</span>
                  </motion.button>
                  
                  <motion.div 
                    className="absolute right-0 mt-2 w-48 glass backdrop-blur-lg rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"
                    initial={{ opacity: 0, y: -10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                  >
                    <motion.button
                      onClick={logout}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-white/10 rounded-xl transition-all"
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign Out
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            ) : (
              <motion.button
                onClick={redirectToLogin}
                className="btn-magnetic bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(102, 126, 234, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-black p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden glass backdrop-blur-lg rounded-2xl mt-4 mb-4 overflow-hidden"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="p-4 space-y-4">
                <motion.div variants={menuItemVariants}>
                  <Link 
                    to="/products" 
                    className="block text-gray-700 hover:text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Products
                  </Link>
                </motion.div>
                
                <motion.div variants={menuItemVariants}>
                  <Link 
                    to="/cart" 
                    className="block text-gray-700 hover:text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart
                  </Link>
                </motion.div>
                
                {user ? (
                  <>
                    <motion.div variants={menuItemVariants}>
                      <Link 
                        to="/orders" 
                        className="block text-gray-700 hover:text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Orders
                      </Link>
                    </motion.div>
                    <motion.div variants={menuItemVariants}>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left text-gray-700 hover:text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={menuItemVariants}>
                    <button
                      onClick={() => {
                        redirectToLogin();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all"
                    >
                      Sign In
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Bar for Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden px-4 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 glass backdrop-blur-lg rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
