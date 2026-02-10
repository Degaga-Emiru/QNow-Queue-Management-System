module.exports = {
  // Collection names
  COLLECTIONS: {
    USERS: 'users',
    BUSINESSES: 'businesses',
    QUEUES: 'queues',
    CUSTOMERS: 'customers',
    COUNTERS: 'counters',
    NOTIFICATIONS: 'notifications',
    ANALYTICS: 'analytics',
    SETTINGS: 'settings'
  },
  
  // Queue status
  QUEUE_STATUS: {
    WAITING: 'waiting',
    CALLED: 'called',
    SERVING: 'serving',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    SKIPPED: 'skipped'
  },
  
  // Counter status
  COUNTER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BUSY: 'busy',
    BREAK: 'break'
  },
  
  // User roles
  USER_ROLES: {
    BUSINESS_OWNER: 'business_owner',
    BUSINESS_STAFF: 'business_staff',
    CUSTOMER: 'customer',
    ADMIN: 'admin'
  },
  
  // Notification types
  NOTIFICATION_TYPES: {
    QUEUE_UPDATE: 'queue_update',
    CALL_NEXT: 'call_next',
    NEAR_TURN: 'near_turn',
    CUSTOMER_JOINED: 'customer_joined',
    SYSTEM_ALERT: 'system_alert'
  },
  
  // Default settings
  DEFAULT_SETTINGS: {
    MAX_QUEUE_LENGTH: 50,
    MAX_WAIT_TIME: 120, // minutes
    NOTIFY_BEFORE_POSITIONS: 3,
    AUTO_CALL_INTERVAL: 30 // seconds
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  }
};