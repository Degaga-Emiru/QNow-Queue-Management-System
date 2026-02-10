import { VALIDATION } from './constants';

// Validation functions
export const validators = {
  required: (value, fieldName = 'Field') => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} is required`;
    }
    return '';
  },

  email: (value) => {
    if (!value) return '';
    if (!VALIDATION.EMAIL_REGEX.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  },

  phone: (value) => {
    if (!value) return '';
    if (!VALIDATION.PHONE_REGEX.test(value)) {
      return 'Please enter a valid phone number';
    }
    return '';
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(value)) {
      return 'Password must contain at least one number';
    }
    return '';
  },

  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  },

  name: (value, fieldName = 'Name') => {
    if (!value) return `${fieldName} is required`;
    if (value.length < VALIDATION.NAME_MIN_LENGTH) {
      return `${fieldName} must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`;
    }
    return '';
  },

  minLength: (value, min, fieldName = 'Field') => {
    if (!value) return '';
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return '';
  },

  maxLength: (value, max, fieldName = 'Field') => {
    if (!value) return '';
    if (value.length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return '';
  },

  number: (value, fieldName = 'Field') => {
    if (!value) return '';
    if (isNaN(value) || value === '') {
      return `${fieldName} must be a number`;
    }
    return '';
  },

  positiveNumber: (value, fieldName = 'Field') => {
    if (!value && value !== 0) return '';
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return `${fieldName} must be a positive number`;
    }
    return '';
  },

  url: (value) => {
    if (!value) return '';
    try {
      new URL(value);
      return '';
    } catch (error) {
      return 'Please enter a valid URL';
    }
  },

  time: (value) => {
    if (!value) return '';
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return 'Please enter a valid time (HH:MM)';
    }
    return '';
  },

  businessCode: (value) => {
    if (!value) return 'Business code is required';
    if (value.length < 4 || value.length > 10) {
      return 'Business code must be between 4 and 10 characters';
    }
    if (!/^[A-Z0-9\-_]+$/.test(value)) {
      return 'Business code can only contain letters, numbers, hyphens, and underscores';
    }
    return '';
  },

  queueNumber: (value) => {
    if (!value) return 'Queue number is required';
    if (!/^[A-Za-z]?\d+$/.test(value)) {
      return 'Invalid queue number format';
    }
    return '';
  },
};

// Validate form data
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];
    
    for (const rule of rules) {
      const error = rule(value, fieldName);
      if (error) {
        errors[fieldName] = error;
        break;
      }
    }
  });
  
  return errors;
};

// Validation schemas for different forms
export const validationSchemas = {
  login: (formData) => validateForm(formData, {
    email: [
      (v) => validators.required(v, 'Email'),
      validators.email,
    ],
    password: [
      (v) => validators.required(v, 'Password'),
    ],
  }),

  register: (formData) => validateForm(formData, {
    email: [
      (v) => validators.required(v, 'Email'),
      validators.email,
    ],
    password: [
      (v) => validators.required(v, 'Password'),
      validators.password,
    ],
    confirmPassword: [
      (v) => validators.confirmPassword(formData.password, v),
    ],
    fullName: [
      (v) => validators.required(v, 'Full name'),
      validators.name,
    ],
  }),

  joinQueue: (formData) => validateForm(formData, {
    customerName: [
      (v) => validators.required(v, 'Name'),
      validators.name,
    ],
    customerPhone: [
      validators.phone,
    ],
    customerEmail: [
      validators.email,
    ],
  }),

  businessProfile: (formData) => validateForm(formData, {
    name: [
      (v) => validators.required(v, 'Business name'),
      (v) => validators.minLength(v, 2, 'Business name'),
    ],
    phone: [
      validators.phone,
    ],
    businessCode: [
      validators.businessCode,
    ],
  }),

  counter: (formData) => validateForm(formData, {
    name: [
      (v) => validators.required(v, 'Counter name'),
      (v) => validators.minLength(v, 2, 'Counter name'),
    ],
    number: [
      validators.positiveNumber,
    ],
  }),

  staff: (formData) => validateForm(formData, {
    email: [
      (v) => validators.required(v, 'Email'),
      validators.email,
    ],
    fullName: [
      (v) => validators.required(v, 'Full name'),
      validators.name,
    ],
  }),
};

// Format validation errors for display
export const formatValidationErrors = (errors) => {
  return Object.entries(errors).map(([field, error]) => ({
    field,
    message: error,
  }));
};

// Check if form has errors
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

// Clear specific field error
export const clearFieldError = (errors, fieldName) => {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};

// Validate all fields on submit
export const validateOnSubmit = (formData, validationSchema) => {
  const errors = validationSchema(formData);
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};