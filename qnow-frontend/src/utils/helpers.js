import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { STATUS_COLORS } from './constants';

// Format date
export const formatDate = (date, formatString = 'PPpp') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    return '';
  }
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return '';
  }
};

// Format time duration
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return 'N/A';
  
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }
};

// Get status color classes
export const getStatusColor = (status, type = 'bg') => {
  const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.waiting;
  
  if (type === 'bg') {
    return `${statusConfig.bg} ${statusConfig.dark.bg}`;
  } else if (type === 'text') {
    return `${statusConfig.text} ${statusConfig.dark.text}`;
  } else if (type === 'all') {
    return `${statusConfig.bg} ${statusConfig.text} ${statusConfig.dark.bg} ${statusConfig.dark.text}`;
  }
  
  return statusConfig.bg;
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if the number looks like it could be valid
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
  
  return phone;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Generate initials
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Calculate queue position
export const calculateQueuePosition = (position, totalWaiting) => {
  if (!position) return 1;
  return position;
};

// Calculate estimated wait time
export const calculateEstimatedWait = (position, avgServingTime = 5, activeCounters = 1) => {
  if (!position) return 0;
  return Math.ceil((position / activeCounters) * avgServingTime);
};

// Generate queue number
export const generateQueueNumber = (prefix = 'Q', number) => {
  return `${prefix}${String(number).padStart(3, '0')}`;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Parse error message
export const parseErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.errors) {
    return error.response.data.errors.map(err => err.msg || err).join(', ');
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An error occurred';
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-()]+$/;
  return phoneRegex.test(phone);
};

// Format bytes to readable size
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Get operating hours status
export const isBusinessOpen = (operatingHours) => {
  if (!operatingHours) return false;
  
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const hours = operatingHours[day];
  
  if (!hours || !hours.isOpen) return false;
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = hours.open.split(':').map(Number);
  const [closeHour, closeMinute] = hours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;
  
  return currentTime >= openTime && currentTime <= closeTime;
};