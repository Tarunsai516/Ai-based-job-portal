import React from 'react';
import Modal from './Modal';

export default function ConfirmationDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure you want to perform this action? This cannot be undone.', confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
  const btnColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors focus:outline-none ${btnColors[type] || btnColors.primary}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
