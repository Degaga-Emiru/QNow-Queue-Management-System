const Joi = require('joi');
const { QUEUE_STATUS, SERVICE_TYPES } = require('../config/constants');

// Join queue validation
const joinQueueValidation = Joi.object({
  businessId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Business ID is required',
      'any.required': 'Business ID is required'
    }),

  serviceType: Joi.string()
    .valid(...Object.values(SERVICE_TYPES || ['general', 'registration', 'payment', 'customer_service', 'other']))
    .default('general')
    .messages({
      'any.only': 'Invalid service type'
    }),

  customerName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Customer name must be at least 2 characters long',
      'string.max': 'Customer name must not exceed 100 characters',
      'string.empty': 'Customer name is required',
      'any.required': 'Customer name is required'
    }),

  customerPhone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number (10-15 digits)'
    }),

  customerEmail: Joi.string()
    .email({ minDomainSegments: 2 })
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),

  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes must not exceed 500 characters'
    }),

  priority: Joi.boolean()
    .default(false),

  metadata: Joi.object()
    .optional()
});

// Get current queue validation
const getQueueValidation = Joi.object({
  status: Joi.string()
    .valid(...Object.values(QUEUE_STATUS))
    .optional()
    .messages({
      'any.only': 'Invalid queue status'
    }),

  serviceType: Joi.string()
    .valid(...Object.values(SERVICE_TYPES || ['general', 'registration', 'payment', 'customer_service', 'other']))
    .optional()
    .messages({
      'any.only': 'Invalid service type'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100',
      'number.integer': 'Limit must be an integer'
    }),

  offset: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Offset must be at least 0',
      'number.integer': 'Offset must be an integer'
    })
});

// Call next customer validation
const callNextCustomerValidation = Joi.object({
  counterId: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Counter ID must not be empty'
    }),

  serviceType: Joi.string()
    .valid(...Object.values(SERVICE_TYPES || ['general', 'registration', 'payment', 'customer_service', 'other', 'all']))
    .optional()
    .default('all')
    .messages({
      'any.only': 'Invalid service type'
    })
});

// Start serving validation
const startServingValidation = Joi.object({
  queueId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Queue ID is required',
      'any.required': 'Queue ID is required'
    })
});

// Complete service validation
const completeServiceValidation = Joi.object({
  queueId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Queue ID is required',
      'any.required': 'Queue ID is required'
    })
});

// Skip customer validation
const skipCustomerValidation = Joi.object({
  queueId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Queue ID is required',
      'any.required': 'Queue ID is required'
    }),

  reason: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Reason must not exceed 200 characters'
    })
});

// Get queue status validation (public)
const getQueueStatusValidation = Joi.object({
  businessCode: Joi.string()
    .length(6)
    .pattern(/^[A-Z0-9]+$/)
    .required()
    .messages({
      'string.length': 'Business code must be exactly 6 characters',
      'string.pattern.base': 'Business code must contain only uppercase letters and numbers',
      'string.empty': 'Business code is required',
      'any.required': 'Business code is required'
    }),

  queueNumber: Joi.string()
    .pattern(/^Q[0-9]{3,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Queue number must start with Q followed by numbers',
      'string.empty': 'Queue number is required',
      'any.required': 'Queue number is required'
    })
});

// Transfer queue validation
const transferQueueValidation = Joi.object({
  queueId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Queue ID is required',
      'any.required': 'Queue ID is required'
    }),

  toCounterId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Target counter ID is required',
      'any.required': 'Target counter ID is required'
    })
});

// Update queue validation
const updateQueueValidation = Joi.object({
  status: Joi.string()
    .valid(...Object.values(QUEUE_STATUS))
    .optional()
    .messages({
      'any.only': 'Invalid queue status'
    }),

  serviceType: Joi.string()
    .valid(...Object.values(SERVICE_TYPES || ['general', 'registration', 'payment', 'customer_service', 'other']))
    .optional()
    .messages({
      'any.only': 'Invalid service type'
    }),

  counterId: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Counter ID must not be empty'
    }),

  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes must not exceed 500 characters'
    }),

  priority: Joi.boolean()
    .optional(),

  estimatedTime: Joi.number()
    .integer()
    .min(0)
    .max(480)
    .optional()
    .messages({
      'number.min': 'Estimated time must be at least 0 minutes',
      'number.max': 'Estimated time must not exceed 480 minutes',
      'number.integer': 'Estimated time must be an integer'
    })
});

// Queue search validation
const searchQueueValidation = Joi.object({
  query: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Search query must be at least 1 character',
      'string.max': 'Search query must not exceed 100 characters',
      'string.empty': 'Search query is required',
      'any.required': 'Search query is required'
    }),

  field: Joi.string()
    .valid('queueNumber', 'customerName', 'customerPhone', 'customerEmail')
    .default('customerName')
    .messages({
      'any.only': 'Invalid search field'
    })
});

module.exports = {
  joinQueueValidation,
  getQueueValidation,
  callNextCustomerValidation,
  startServingValidation,
  completeServiceValidation,
  skipCustomerValidation,
  getQueueStatusValidation,
  transferQueueValidation,
  updateQueueValidation,
  searchQueueValidation
};