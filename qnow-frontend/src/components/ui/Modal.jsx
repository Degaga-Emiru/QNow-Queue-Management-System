import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`
                w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl 
                bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl 
                transition-all ${className}
              `}>
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between mb-6">
                    {title && (
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                      </Dialog.Title>
                    )}
                    
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close modal"
                      >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </button>
                    )}
                  </div>
                )}
                
                {/* Content */}
                <div className="mt-2">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Confirmation Modal
export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false 
}) => {
  const variantClasses = {
    danger: 'bg-red-500 hover:bg-red-600',
    primary: 'gradient-primary hover:opacity-90',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
  };

  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title}>
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;