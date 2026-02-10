const Joi = require('joi');

// Business creation/update validation
const businessValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Business name must be at least 2 characters long',
      'string.max': 'Business name must not exceed 200 characters',
      'string.empty': 'Business name is required',
      'any.required': 'Business name is required'
    }),

  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number (10-15 digits)'
    }),

  address: Joi.string()
    .max(300)
    .optional()
    .messages({
      'string.max': 'Address must not exceed 300 characters'
    }),

  category: Joi.string()
    .max(100)
    .default('general')
    .messages({
      'string.max': 'Category must not exceed 100 characters'
    }),

  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),

  logo: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Please provide a valid logo URL'
    }),

  website: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Please provide a valid website URL'
    }),

  settings: Joi.object({
    maxQueueLength: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .default(50)
      .messages({
        'number.min': 'Max queue length must be at least 1',
        'number.max': 'Max queue length must not exceed 1000',
        'number.integer': 'Max queue length must be an integer'
      }),

    maxWaitTime: Joi.number()
      .integer()
      .min(1)
      .max(480)
      .default(120)
      .messages({
        'number.min': 'Max wait time must be at least 1 minute',
        'number.max': 'Max wait time must not exceed 480 minutes',
        'number.integer': 'Max wait time must be an integer'
      }),

    notifyBeforePositions: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .default(3)
      .messages({
        'number.min': 'Notify before positions must be at least 1',
        'number.max': 'Notify before positions must not exceed 10',
        'number.integer': 'Notify before positions must be an integer'
      }),

    autoCallInterval: Joi.number()
      .integer()
      .min(1)
      .max(120)
      .default(30)
      .messages({
        'number.min': 'Auto call interval must be at least 1 second',
        'number.max': 'Auto call interval must not exceed 120 seconds',
        'number.integer': 'Auto call interval must be an integer'
      }),

    allowRemoteJoin: Joi.boolean()
      .default(true),

    requireCustomerInfo: Joi.boolean()
      .default(false),

    enableSmsNotifications: Joi.boolean()
      .default(false),

    enableEmailNotifications: Joi.boolean()
      .default(true),

    enablePushNotifications: Joi.boolean()
      .default(true)
  }).optional(),

  operatingHours: Joi.object({
    monday: Joi.object({
      open: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Opening time must be in HH:MM format',
          'any.required': 'Opening time is required'
        }),
      close: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Closing time must be in HH:MM format',
          'any.required': 'Closing time is required'
        }),
      isOpen: Joi.boolean()
        .default(true)
    }).required(),

    tuesday: Joi.object({
      open: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Opening time must be in HH:MM format',
          'any.required': 'Opening time is required'
        }),
      close: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Closing time must be in HH:MM format',
          'any.required': 'Closing time is required'
        }),
      isOpen: Joi.boolean()
        .default(true)
    }).required(),

    wednesday: Joi.object({
      open: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Opening time must be in HH:MM format',
          'any.required': 'Opening time is required'
        }),
      close: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Closing time must be in HH:MM format',
          'any.required': 'Closing time is required'
        }),
      isOpen: Joi.boolean()
        .default(true)
    }).required(),

    thursday: Joi.object({
      open: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Opening time must be in HH:MM format',
          'any.required': 'Opening time is required'
        }),
      close: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Closing time must be in HH:MM format',
          'any.required': 'Closing time is required'
        }),
      isOpen: Joi.boolean()
        .default(true)
    }).required(),

    friday: Joi.object({
      open: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Opening time must be in HH:MM format',
          'any.required': 'Opening time is required'
        }),
      close: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Closing time must be in HH:MM format',
          'any.required': 'Closing time is required'
        }),
      isOpen: Joi.boolean()
        .default(true)
    }).required(),

    saturday: Joi.object({
      open: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
          'string.pattern.base': 'Opening time must be in HH:MM format'
        }),
      close: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
          'string.pattern.base': 'Closing time must be in HH:MM format'
        }),
      isOpen: Joi.boolean()
        .default(false)
    }).optional(),

    sunday: Joi.object({
      open: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
          'string.pattern.base': 'Opening time must be in HH:MM format'
        }),
      close: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
          'string.pattern.base': 'Closing time must be in HH:MM format'
        }),
      isOpen: Joi.boolean()
        .default(false)
    }).optional()
  }).optional()
});

// Business code validation
const businessCodeValidation = Joi.object({
  businessCode: Joi.string()
    .length(6)
    .pattern(/^[A-Z0-9]+$/)
    .required()
    .messages({
      'string.length': 'Business code must be exactly 6 characters',
      'string.pattern.base': 'Business code must contain only uppercase letters and numbers',
      'string.empty': 'Business code is required',
      'any.required': 'Business code is required'
    })
});

// Business analytics query validation
const analyticsValidation = Joi.object({
  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date'
    }),

  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date'
    }),

  period: Joi.string()
    .valid('today', 'week', 'month', 'year')
    .optional()
    .messages({
      'any.only': 'Period must be one of: today, week, month, year'
    })
});

// Business settings update validation
const updateSettingsValidation = Joi.object({
  maxQueueLength: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'number.min': 'Max queue length must be at least 1',
      'number.max': 'Max queue length must not exceed 1000',
      'number.integer': 'Max queue length must be an integer'
    }),

  maxWaitTime: Joi.number()
    .integer()
    .min(1)
    .max(480)
    .optional()
    .messages({
      'number.min': 'Max wait time must be at least 1 minute',
      'number.max': 'Max wait time must not exceed 480 minutes',
      'number.integer': 'Max wait time must be an integer'
    }),

  notifyBeforePositions: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .optional()
    .messages({
      'number.min': 'Notify before positions must be at least 1',
      'number.max': 'Notify before positions must not exceed 10',
      'number.integer': 'Notify before positions must be an integer'
    }),

  autoCallInterval: Joi.number()
    .integer()
    .min(1)
    .max(120)
    .optional()
    .messages({
      'number.min': 'Auto call interval must be at least 1 second',
      'number.max': 'Auto call interval must not exceed 120 seconds',
      'number.integer': 'Auto call interval must be an integer'
    }),

  allowRemoteJoin: Joi.boolean()
    .optional(),

  requireCustomerInfo: Joi.boolean()
    .optional(),

  enableSmsNotifications: Joi.boolean()
    .optional(),

  enableEmailNotifications: Joi.boolean()
    .optional(),

  enablePushNotifications: Joi.boolean()
    .optional()
});

module.exports = {
  businessValidation,
  businessCodeValidation,
  analyticsValidation,
  updateSettingsValidation
};