import React from 'react';
import { HiOutlineSparkles } from 'react-icons/hi';

export default function FilterSidebar({ filters, setFilters, onClose }) {
  const handleTypeChange = (type) => {
    const nextTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    setFilters({ ...filters, types: nextTypes });
  };

  const handleExperienceChange = (exp) => {
    const nextExp = filters.experience.includes(exp)
      ? filters.experience.filter((e) => e !== exp)
      : [...filters.experience, exp];
    setFilters({ ...filters, experience: nextExp });
  };

  const clearAll = () => {
    setFilters({
      types: [],
      experience: [],
      location: '',
      aiOnly: false
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm w-full space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
        <button
          onClick={clearAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* AI Recommendation Toggle */}
      <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
        <div className="flex items-center space-x-2">
          <HiOutlineSparkles className="h-5 w-5 text-blue-600 animate-pulse" />
          <span className="text-xs font-bold text-blue-800">AI Recommended Only</span>
        </div>
        <button
          onClick={() => setFilters({ ...filters, aiOnly: !filters.aiOnly })}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${
            filters.aiOnly ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${
              filters.aiOnly ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Location</label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          placeholder="e.g. San Francisco"
          className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>

      {/* Job Type Checkboxes */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Job Type</label>
        <div className="space-y-2">
          {['Remote', 'Hybrid', 'Onsite'].map((type) => (
            <label key={type} className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => handleTypeChange(type)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Checkboxes */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Experience</label>
        <div className="space-y-2">
          {['Entry', 'Mid', 'Senior'].map((exp) => (
            <label key={exp} className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.experience.includes(exp)}
                onChange={() => handleExperienceChange(exp)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{exp} Level</span>
            </label>
          ))}
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="md:hidden w-full text-center py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors mt-4"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
}
