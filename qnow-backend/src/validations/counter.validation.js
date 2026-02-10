const Joi = require('joi');
const { COUNTER_STATUS } = require('../config/constants');

// Create/update counter validation
const counterValidation = Joi.object({
  businessId: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Business ID must not be empty'
    }),

  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Counter name must be at least 2 characters long',
      'string.max': 'Counter name must not exceed 100 characters',
      'string.empty': 'Counter name is required',
      'any.required': 'Counter name is required'
    }),

  number: Joi.number()
    .integer()
    .min(1)
    .max(999)
    .required()
    .messages({
      'number.min': 'Counter number must be at least 1',
      'number.max': 'Counter number must not exceed 999',
      'number.integer': 'Counter number must be an integer',
      'any.required': 'Counter number is required'
    }),

  serviceType: Joi.string()
    .valid('general', 'registration', 'payment', 'customer_service', 'other')
    .default('general')
    .messages({
      'any.only': 'Invalid service type'
    }),

  staffId: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Staff ID must not be empty'
    }),

  staffName: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Staff name must be at least 2 characters long',
      'string.max': 'Staff name must not exceed 100 characters'
    }),

  status: Joi.string()
    .valid(...Object.values(COUNTER_STATUS))
    .default(COUNTER_STATUS.INACTIVE)
    .messages({
      'any.only': 'Invalid counter status'
    }),

  settings: Joi.object({
    autoCall: Joi.boolean()
      .default(false),

    maxCustomersPerHour: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.min': 'Max customers per hour must be at least 1',
        'number.max': 'Max customers per hour must not exceed 100',
        'number.integer': 'Max customers per hour must be an integer'
      }),

    breakDuration: Joi.number()
      .integer()
      .min(1)
      .max(60)
      .default(15)
      .messages({
        'number.min': 'Break duration must be at least 1 minute',
        'number.max': 'Break duration must not exceed 60 minutes',
        'number.integer': 'Break duration must be an integer'
      }),

    breakFrequency: Joi.number()
      .integer()
      .min(30)
      .max(480)
      .default(120)
      .messages({
        'number.min': 'Break frequency must be at least 30 minutes',
        'number.max': 'Break frequency must not exceed 480 minutes',
        'number.integer': 'Break frequency must be an integer'
      })
  }).optional(),

  isActive: Joi.boolean()
    .default(true)
});

// Assign counter validation
const assignCounterValidation = Joi.object({
  staffId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Staff ID is required',
      'any.required': 'Staff ID is required'
    }),

  staffName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Staff name must be at least 2 characters long',
      'string.max': 'Staff name must not exceed 100 characters',
      'string.empty': 'Staff name is required',
      'any.required': 'Staff name is required'
    })
});

// Set counter break validation
const setBreakValidation = Joi.object({
  duration: Joi.number()
    .integer()
    .min(1)
    .max(60)
    .default(15)
    .messages({
      'number.min': 'Break duration must be at least 1 minute',
      'number.max': 'Break duration must not exceed 60 minutes',
      'number.integer': 'Break duration must be an integer'
    }),

  reason: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Reason must not exceed 200 characters'
    })
});

// Counter filter validation
const counterFilterValidation = Joi.object({
  status: Joi.string()
    .valid(...Object.values(COUNTER_STATUS))
    .optional()
    .messages({
      'any.only': 'Invalid counter status'
    }),

  serviceType: Joi.string()
    .valid('general', 'registration', 'payment', 'customer_service', 'other', 'all')
    .optional()
    .messages({
      'any.only': 'Invalid service type'
    }),

  isActive: Joi.boolean()
    .optional(),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100',
      'number.integer': 'Limit must be an integer'
    })
});

module.exports = {
  counterValidation,
  assignCounterValidation,
  setBreakValidation,
  counterFilterValidation
};