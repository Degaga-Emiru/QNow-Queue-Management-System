import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Home, Building, Users } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, business, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <span className="text-2xl font-bold gradient-text">QNow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              <Home className="w-4 h-4 inline mr-1" />
              Home
            </Link>
            <Link to="/customer" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              Join Queue
            </Link>
            
            {user && (hasRole('business_owner') || hasRole('business_staff')) && business && (
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                <Building className="w-4 h-4 inline mr-1" />
                Dashboard
              </Link>
            )}
            
            {user && hasRole('admin') && (
              <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <User size={20} />
                    <span className="hidden lg:inline">{user.fullName}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 hidden group-hover:block z-10 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                    
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Profile
                    </Link>
                    
                    {business && (
                      <Link to="/business/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Business Settings
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/customer" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                Join Queue
              </Link>
              
              {user && (hasRole('business_owner') || hasRole('business_staff')) && business && (
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
              )}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                {user ? (
                  <>
                    <div className="mb-4">
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                    
                    <Link to="/profile" className="block py-2 hover:text-primary" onClick={() => setIsOpen(false)}>
                      Profile
                    </Link>
                    
                    {business && (
                      <Link to="/business/profile" className="block py-2 hover:text-primary" onClick={() => setIsOpen(false)}>
                        Business Settings
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left py-2 text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;