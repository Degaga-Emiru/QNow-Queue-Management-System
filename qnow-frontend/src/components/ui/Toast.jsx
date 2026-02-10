// This component is not needed as we're using react-hot-toast
// But here's a custom toast component if you want more control

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  showClose = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) setTimeout(onClose, 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) setTimeout(onClose, 300);
  };

  const typeConfig = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-300',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-300',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-300',
      icon: <Info className="w-5 h-5 text-blue-500" />,
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${isVisible ? 'animate-slide-up' : 'animate-slide-down'}`}>
      <div className={`
        flex items-start space-x-3 p-4 rounded-lg shadow-lg 
        ${config.bg} ${config.border} border 
        max-w-sm transform transition-all duration-300
      `}>
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        
        <div className={`flex-1 ${config.text}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        
        {showClose && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close toast"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Toast Container for managing multiple toasts
export const ToastContainer = ({ children }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {children}
  </div>
);

export default Toast;