import React from 'react';
import { HiSearch, HiOutlineAdjustments } from 'react-icons/hi';

export default function SearchBar({ value, onChange, placeholder = 'Search jobs, titles, or keywords...', onToggleFilters, showFilterBtn = true }) {
  return (
    <div className="flex items-center space-x-2 w-full">
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiSearch className="h-5 w-5 text-gray-400" />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        />
      </div>
      {showFilterBtn && (
        <button
          onClick={onToggleFilters}
          className="p-3 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Toggle Filters"
        >
          <HiOutlineAdjustments className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
