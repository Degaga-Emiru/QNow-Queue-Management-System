import React from 'react';

const Skeleton = ({ type = 'text', width, height, className = '', count = 1 }) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const types = {
    text: 'h-4',
    title: 'h-6',
    heading: 'h-8',
    avatar: 'rounded-full',
    button: 'h-10',
    card: 'h-48',
    image: 'h-64',
    circle: 'rounded-full',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  if (count > 1) {
    return (
      <div className="space-y-2">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${types[type] || types.text} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${types[type] || types.text} ${className}`}
      style={style}
    />
  );
};

// Card Skeleton
export const CardSkeleton = ({ withImage = false }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    {withImage && <Skeleton type="image" className="mb-4" />}
    <Skeleton type="title" className="mb-2 w-3/4" />
    <Skeleton type="text" count={3} />
    <div className="flex space-x-2 mt-4">
      <Skeleton type="button" className="w-24" />
      <Skeleton type="button" className="w-24" />
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    <Skeleton type="text" className="h-12" />
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {[...Array(columns)].map((_, colIndex) => (
          <Skeleton key={colIndex} type="text" className="flex-1 h-10" />
        ))}
      </div>
    ))}
  </div>
);

// Dashboard Stats Skeleton
export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <Skeleton type="text" className="w-1/2 mb-2" />
        <Skeleton type="heading" className="w-1/3" />
      </div>
    ))}
  </div>
);

// Form Skeleton
export const FormSkeleton = ({ fields = 4 }) => (
  <div className="space-y-6">
    {[...Array(fields)].map((_, i) => (
      <div key={i}>
        <Skeleton type="text" className="w-1/4 mb-2" />
        <Skeleton type="text" className="h-10" />
      </div>
    ))}
    <div className="flex space-x-3 pt-4">
      <Skeleton type="button" className="w-24 h-10" />
      <Skeleton type="button" className="w-24 h-10" />
    </div>
  </div>
);

export default Skeleton;