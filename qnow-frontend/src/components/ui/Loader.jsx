import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full`}></div>
        <div className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full absolute top-0 left-0 animate-spin`}></div>
      </div>
    </div>
  );
};

// Spinner component for inline loading
export const Spinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full border-2 border-gray-300 dark:border-gray-600 rounded-full border-t-primary animate-spin"></div>
    </div>
  );
};

// Full page loader
export const FullPageLoader = () => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
    <div className="text-center">
      <Loader size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Content loader skeleton
export const ContentLoader = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ 
        width: i === lines - 1 ? '60%' : '100%' 
      }}></div>
    ))}
  </div>
);

export default Loader;