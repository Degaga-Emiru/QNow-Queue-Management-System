import React from 'react';
import { Star, Quote } from 'lucide-react';
import Card from '../ui/Card';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Hospital Administrator',
      company: 'City General Hospital',
      content: 'QNow reduced our patient waiting times by 40%. The system is incredibly intuitive for both staff and patients. Customer satisfaction scores have never been higher!',
      rating: 5,
      avatar: 'SJ',
      color: 'bg-blue-500',
    },
    {
      name: 'Mike Chen',
      role: 'Bank Manager',
      company: 'First National Bank',
      content: 'Customer satisfaction improved dramatically. The real-time updates keep everyone informed and reduce anxiety. Our tellers are more efficient than ever.',
      rating: 5,
      avatar: 'MC',
      color: 'bg-green-500',
    },
    {
      name: 'Emma Davis',
      role: 'Government Office Director',
      company: 'City Hall Services',
      content: 'The analytics helped us optimize staff schedules. Queue management has never been this efficient. We serve 30% more people daily without increasing staff.',
      rating: 5,
      avatar: 'ED',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Trusted by Businesses Worldwide</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          See what our customers have to say about their experience with QNow
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="relative p-6 card-hover">
            <div className="absolute -top-4 right-4">
              <Quote className="w-8 h-8 text-primary/20" />
            </div>
            
            {/* Rating */}
            <div className="flex mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            
            {/* Content */}
            <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
              "{testimonial.content}"
            </p>
            
            {/* Author */}
            <div className="flex items-center">
              <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold mr-4`}>
                {testimonial.avatar}
              </div>
              <div>
                <h4 className="font-semibold">{testimonial.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{testimonial.company}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Stats */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { value: '98%', label: 'Customer Satisfaction' },
          { value: '40%', label: 'Reduced Wait Times' },
          { value: '500+', label: 'Businesses Served' },
          { value: '24/7', label: 'Support Available' },
        ].map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
            <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;