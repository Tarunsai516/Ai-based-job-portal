import React from 'react';
import { HiSearch, HiOutlineAdjustments } from 'react-icons/hi';

export default function SearchBar({ value, onChange, placeholder = 'Search jobs, titles, or keywords...', onToggleFilters, showFilterBtn = true }) {
  return (
    <div className="flex items-center space-x-2 w-full">
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
        />
      </div>
      {showFilterBtn && (
        <button
          onClick={onToggleFilters}
          className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Toggle Filters"
        >
          <HiOutlineAdjustments className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
