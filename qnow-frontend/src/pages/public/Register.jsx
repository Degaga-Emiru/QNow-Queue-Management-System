import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building, Check, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const Register = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    businessName: '',
    businessCategory: '',
    businessAddress: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (userType === 'business_owner') {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }
      
      if (!formData.businessCategory.trim()) {
        newErrors.businessCategory = 'Business category is required';
      }
    }
    
    return newErrors;
  };

  const handleNext = () => {
    if (step === 1) {
      const step1Errors = validateStep1();
      if (Object.keys(step1Errors).length > 0) {
        setErrors(step1Errors);
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const step2Errors = validateStep2();
    if (Object.keys(step2Errors).length > 0) {
      setErrors(step2Errors);
      return;
    }
    
    try {
      setLoading(true);
      
      const registerData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: userType,
      };
      
      if (userType === 'business_owner') {
        registerData.businessData = {
          name: formData.businessName,
          category: formData.businessCategory,
          address: formData.businessAddress,
        };
      }
      
      await register(registerData);
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled by auth context
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Start your 14-day free trial
            </p>
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'gradient-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                1
              </div>
              <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'gradient-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'gradient-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                2
              </div>
            </div>
          </div>
          
          <Card className="p-8">
            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Account Information</h2>
                  
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={Mail}
                    required
                  />
                  
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    icon={Lock}
                    required
                  />
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Password must contain:
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        {formData.password.length >= 6 ? (
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <X className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        At least 6 characters
                      </div>
                      <div className="flex items-center text-sm">
                        {/(?=.*[A-Z])/.test(formData.password) ? (
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <X className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        At least one uppercase letter
                      </div>
                      <div className="flex items-center text-sm">
                        {/(?=.*\d)/.test(formData.password) ? (
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <X className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        At least one number
                      </div>
                    </div>
                  </div>
                  
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    icon={Lock}
                    required
                  />
                  
                  <div className="pt-4">
                    <Button type="button" onClick={handleNext} className="w-full">
                      Continue
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold mb-3">I am a...</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <input
                            type="radio"
                            name="userType"
                            value="customer"
                            checked={userType === 'customer'}
                            onChange={(e) => setUserType(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <div>
                            <div className="font-medium">Customer</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Join queues and track your position
                            </div>
                          </div>
                        </label>
                        
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <input
                            type="radio"
                            name="userType"
                            value="business_owner"
                            checked={userType === 'business_owner'}
                            onChange={(e) => setUserType(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <div>
                            <div className="font-medium">Business Owner</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Manage queues and staff
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Account Type Benefits</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          <span>Real-time queue updates</span>
                        </div>
                        {userType === 'business_owner' && (
                          <>
                            <div className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                              <span>Business dashboard</span>
                            </div>
                            <div className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                              <span>Staff management</span>
                            </div>
                            <div className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                              <span>Analytics & reports</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Input
                    label="Full Name"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    icon={User}
                    required
                  />
                  
                  <Input
                    label="Phone Number (Optional)"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    icon={Phone}
                  />
                  
                  {userType === 'business_owner' && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                        
                        <div className="space-y-6">
                          <Input
                            label="Business Name"
                            name="businessName"
                            type="text"
                            placeholder="Enter your business name"
                            value={formData.businessName}
                            onChange={handleChange}
                            error={errors.businessName}
                            icon={Building}
                            required
                          />
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Business Category
                            </label>
                            <select
                              name="businessCategory"
                              value={formData.businessCategory}
                              onChange={handleChange}
                              className="input-field"
                              required
                            >
                              <option value="">Select category</option>
                              <option value="healthcare">Healthcare</option>
                              <option value="banking">Banking</option>
                              <option value="government">Government Office</option>
                              <option value="retail">Retail</option>
                              <option value="restaurant">Restaurant</option>
                              <option value="education">Education</option>
                              <option value="other">Other</option>
                            </select>
                            {errors.businessCategory && (
                              <div className="text-sm text-red-500 mt-1">{errors.businessCategory}</div>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Business Address (Optional)
                            </label>
                            <textarea
                              name="businessAddress"
                              value={formData.businessAddress}
                              onChange={handleChange}
                              rows="3"
                              className="input-field"
                              placeholder="Enter business address"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="flex space-x-4 pt-4">
                    <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" loading={loading} className="flex-1">
                      Create Account
                    </Button>
                  </div>
                </div>
              )}
              
              <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
              
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;