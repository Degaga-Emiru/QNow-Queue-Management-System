import React from 'react';
import { 
  UserPlus, 
  Smartphone, 
  Bell, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Card from '../ui/Card';

const HowItWorks = () => {
  const steps = [
    {
      step: '1',
      title: 'Business Sets Up',
      description: 'Create your service counters and generate a unique business code',
      icon: <UserPlus className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      step: '2',
      title: 'Customer Joins Queue',
      description: 'Customers scan QR or enter code to join queue remotely',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
    },
    {
      step: '3',
      title: 'Smart Management',
      description: 'Staff manages queue, customers get real-time updates',
      icon: <Bell className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
    },
    {
      step: '4',
      title: 'Service & Feedback',
      description: 'Complete service and collect customer feedback',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">How It Works in 4 Simple Steps</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Our streamlined process makes queue management effortless for both businesses and customers
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <Card key={index} className="relative p-6 card-hover">
            <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
              {step.step}
            </div>
            <div className="pt-8 text-center">
              <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <div className="text-white">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
            </div>
            
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </Card>
        ))}
      </div>
      
      {/* Step-by-step Flow Visualization */}
      <div className="mt-16 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Join thousands of businesses already using QNow
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn-primary px-6 py-3 rounded-lg">
              Start Free Trial
            </button>
            <button className="btn-secondary px-6 py-3 rounded-lg">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;