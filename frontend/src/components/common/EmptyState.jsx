import React from 'react';

export default function EmptyState({ icon = '🔍', title = 'No results found', message = 'Try expanding your search query or adjusting your dashboard filters.', actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-xl shadow-sm w-full transition-colors">
      <span className="text-4xl mb-4 select-none">{icon}</span>
      <h3 className="text-base font-bold text-gray-905 dark:text-gray-100">{title}</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors focus:outline-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
