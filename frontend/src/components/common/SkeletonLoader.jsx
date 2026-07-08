import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const renderSkeleton = () => {
    if (type === 'card') {
      return (
        <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm space-y-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="flex space-x-3 pt-2">
            <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
          </div>
        </div>
      );
    }

    if (type === 'list') {
      return (
        <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm animate-pulse flex justify-between items-center">
          <div className="flex items-center space-x-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-gray-200 rounded w-1/4"></div>
              <div className="h-2.5 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
        </div>
      );
    }

    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  };

  return (
    <div className="grid gap-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
}
