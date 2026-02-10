import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

const Hero = () => {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <CheckCircle className="w-4 h-4 mr-2" />
          Trusted by 500+ businesses worldwide
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Smart Queue Management{' '}
          <span className="gradient-text">Made Simple</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Transform waiting experiences with real-time queue management for hospitals, banks, offices, and service businesses.
          Join queues remotely, track progress, and receive notifications.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/register?type=business">
            <Button size="lg" className="flex items-center space-x-2">
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/customer">
            <Button variant="secondary" size="lg">
              Join Queue as Customer
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Watch Demo</span>
          </Button>
        </div>
        
        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto">
          {[
            { text: 'No hardware required' },
            { text: 'Real-time updates' },
            { text: 'Easy setup in minutes' },
            { text: '24/7 support' },
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hero Image/Illustration */}
      <div className="mt-16 max-w-5xl mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Dashboard Preview */}
              <div className="md:col-span-2">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm text-gray-400">Dashboard Preview</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-2 bg-gray-700 rounded-full w-1/4"></div>
                      <div className="h-2 bg-gray-700 rounded-full w-1/3"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
                      ))}
                    </div>
                    <div className="h-32 bg-gray-700 rounded-lg"></div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Preview */}
              <div className="flex flex-col items-center">
                <div className="w-48 h-96 bg-gray-900 rounded-3xl p-4 relative">
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
                  <div className="mt-8 space-y-4">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-8 bg-primary rounded-lg"></div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-gray-700 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Mobile Customer View</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;