import React from 'react';
import { 
  Clock, 
  Users, 
  BarChart, 
  Shield, 
  Bell, 
  Zap,
  Smartphone,
  Cloud,
  Lock,
  TrendingUp,
  Globe,
  Heart
} from 'lucide-react';
import Card from '../ui/Card';

const Features = () => {
  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Real-time Updates',
      description: 'Customers see live queue positions and estimated wait times',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Smart Distribution',
      description: 'Automatically balance queues across available counters',
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Track performance metrics and optimize operations',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime',
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: 'Smart Notifications',
      description: 'Automated alerts via SMS, email, or push notifications',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Fast Setup',
      description: 'Get started in minutes with no hardware required',
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile First',
      description: 'Fully responsive design works on any device',
      color: 'text-pink-500',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: 'Cloud Based',
      description: 'Access your queue from anywhere, anytime',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20',
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Why Choose QNow?</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Our platform offers everything you need to manage queues efficiently and improve customer experience
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 text-center card-hover">
            <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <div className={feature.color}>
                {feature.icon}
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
          </Card>
        ))}
      </div>
      
      {/* Additional Benefits */}
      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Boost Efficiency</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Reduce wait times by up to 40% with intelligent queue management
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Happy Customers</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Improve customer satisfaction with transparent wait times
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Global Reach</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Trusted by businesses in 20+ countries worldwide
          </p>
        </div>
      </div>
    </div>
  );
};

export default Features;