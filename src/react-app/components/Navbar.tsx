import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { Menu, ShoppingCart, User, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, redirectToLogin, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-black">StepForward</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/products" 
              className="text-gray-600 hover:text-black font-medium transition-colors"
            >
              Products
            </Link>
            <Link 
              to="/cart" 
              className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
            >
              <ShoppingCart size={20} />
              <span>Cart</span>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/orders" 
                  className="text-gray-600 hover:text-black font-medium transition-colors"
                >
                  Orders
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-black">
                    {user.google_user_data.picture ? (
                      <img 
                        src={user.google_user_data.picture} 
                        alt={user.google_user_data.name || 'User'} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User size={20} />
                    )}
                    <span className="hidden lg:block">{user.google_user_data.given_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={redirectToLogin}
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-black"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-2">
              <Link 
                to="/products" 
                className="block text-gray-600 hover:text-black font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/cart" 
                className="block text-gray-600 hover:text-black font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Cart
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/orders" 
                    className="block text-gray-600 hover:text-black font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-600 hover:text-black font-medium py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    redirectToLogin();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-600 hover:text-black font-medium py-2"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
