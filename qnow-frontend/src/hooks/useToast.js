import toast from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
    });
  };

  const showError = (message) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    });
  };

  const showLoading = (message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  };

  const dismissToast = (toastId) => {
    toast.dismiss(toastId);
  };

  const showPromise = (promise, messages) => {
    return toast.promise(promise, messages, {
      position: 'top-right',
    });
  };

  return {
    showSuccess,
    showError,
    showLoading,
    dismissToast,
    showPromise
  };
};