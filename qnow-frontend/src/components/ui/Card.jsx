import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'p-6',
  onClick,
  ...props 
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        rounded-xl shadow-lg 
        ${padding}
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

export const CardSubtitle = ({ children, className = '' }) => (
  <p className={`text-gray-600 dark:text-gray-400 mt-1 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export default Card;