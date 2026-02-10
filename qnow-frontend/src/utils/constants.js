// Application Constants
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  BUSINESS_OWNER: 'business_owner',
  BUSINESS_STAFF: 'business_staff',
  CUSTOMER: 'customer',
};

// Queue Status
export const QUEUE_STATUS = {
  WAITING: 'waiting',
  CALLED: 'called',
  SERVING: 'serving',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SKIPPED: 'skipped',
};

// Counter Status
export const COUNTER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BUSY: 'busy',
  BREAK: 'break',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  QUEUE_UPDATE: 'queue_update',
  CALL_NEXT: 'call_next',
  NEAR_TURN: 'near_turn',
  SERVICE_COMPLETED: 'service_completed',
  CUSTOMER_SKIPPED: 'customer_skipped',
};

// Business Categories
export const BUSINESS_CATEGORIES = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'banking', label: 'Banking & Finance' },
  { value: 'government', label: 'Government Office' },
  { value: 'retail', label: 'Retail Store' },
  { value: 'restaurant', label: 'Restaurant & Food' },
  { value: 'education', label: 'Education' },
  { value: 'service', label: 'Service Business' },
  { value: 'other', label: 'Other' },
];

// Service Types
export const SERVICE_TYPES = [
  'General Service',
  'Customer Service',
  'Registration',
  'Payment',
  'Consultation',
  'Billing',
  'Technical Support',
  'Appointment',
];

// Time Intervals
export const TIME_INTERVALS = {
  AUTO_REFRESH: 30000, // 30 seconds
  QUEUE_STATUS_CHECK: 10000, // 10 seconds
  NOTIFICATION_TIMEOUT: 5000, // 5 seconds
};

// Validation Constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[\d\s\-()]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
};

// Colors for Status
export const STATUS_COLORS = {
  waiting: { bg: 'bg-blue-100', text: 'text-blue-800', dark: { bg: 'dark:bg-blue-900', text: 'dark:text-blue-300' } },
  called: { bg: 'bg-yellow-100', text: 'text-yellow-800', dark: { bg: 'dark:bg-yellow-900', text: 'dark:text-yellow-300' } },
  serving: { bg: 'bg-green-100', text: 'text-green-800', dark: { bg: 'dark:bg-green-900', text: 'dark:text-green-300' } },
  completed: { bg: 'bg-gray-100', text: 'text-gray-800', dark: { bg: 'dark:bg-gray-800', text: 'dark:text-gray-300' } },
  skipped: { bg: 'bg-red-100', text: 'text-red-800', dark: { bg: 'dark:bg-red-900', text: 'dark:text-red-300' } },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  BUSINESS: 'business',
  LANGUAGE: 'language',
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'Access denied. You don\'t have permission.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  DEFAULT: 'Something went wrong. Please try again.',
};