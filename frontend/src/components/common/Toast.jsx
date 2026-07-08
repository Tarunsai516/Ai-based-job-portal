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
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const icons = {
    success: <HiCheckCircle className="h-5 w-5 text-emerald-600" />,
    error: <HiExclamationCircle className="h-5 w-5 text-red-600" />,
    info: <HiExclamationCircle className="h-5 w-5 text-blue-600" />,
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
          className="p-0.5 rounded-full hover:bg-black/5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <HiX className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
