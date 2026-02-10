import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { validators } from '../../utils/validators';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const authType = searchParams.get('type') || 'login';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear form when switching between login/register
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
    });
    setErrors({});
  }, [authType]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        error = validators.email(value) || validators.required(value, 'Email');
        break;
      case 'password':
        if (authType === 'login') {
          error = validators.required(value, 'Password');
        } else {
          error = validators.password(value);
        }
        break;
      case 'confirmPassword':
        if (authType === 'register') {
          error = validators.confirmPassword(formData.password, value);
        }
        break;
      case 'fullName':
        if (authType === 'register') {
          error = validators.name(value, 'Full name');
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      const error = validateField(name, value);
      if (!error) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      if (field === 'confirmPassword' && authType === 'login') return;
      if (field === 'fullName' && authType === 'login') return;
      if (field === 'phone' && authType === 'login') return;
      
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setLoading(true);
      
      if (authType === 'login') {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          role: 'customer',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Error is handled by auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {authType === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {authType === 'login' 
                ? 'Sign in to manage your queues' 
                : 'Join thousands of businesses using QNow'}
            </p>
          </div>
          
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {authType === 'register' && (
                <Input
                  label="Full Name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  required
                />
              )}
              
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={Lock}
                required
              />
              
              {authType === 'register' && (
                <>
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
                  
                  <Input
                    label="Phone Number (Optional)"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                  />
                </>
              )}
              
              {authType === 'login' && (
                <div className="flex justify-between items-center">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary" 
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                  </label>
                  <button 
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              
              <Button type="submit" className="w-full" loading={loading}>
                {authType === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
              
              {authType === 'login' && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Google</span>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
                      </svg>
                      <span>GitHub</span>
                    </Button>
                  </div>
                </>
              )}
              
              <p className="text-center text-gray-600 dark:text-gray-400">
                {authType === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => navigate(`/auth?type=${authType === 'login' ? 'register' : 'login'}`)}
                >
                  {authType === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
              
              {authType === 'register' && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              )}
            </form>
          </Card>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;