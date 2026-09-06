import React, { useEffect } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700',
    error: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
    info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
  };

  const icons = {
    success: <HiCheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    error: <HiExclamationCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    info: <HiExclamationCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-55">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`flex items-center space-x-3 p-4 rounded-xl border shadow-lg max-w-sm ${typeStyles[type]}`}
      >
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="text-xs font-semibold flex-1">{message}</div>
        <button
          onClick={onClose}
          className="p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <HiX className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
