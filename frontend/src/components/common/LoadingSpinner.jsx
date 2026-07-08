import React from 'react';

export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent ${sizeClasses[size] || sizeClasses.md}`}></div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
}
