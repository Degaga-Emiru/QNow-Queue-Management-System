import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  BarChart, 
  ArrowRight, 
  Shield, 
  Bell, 
  Zap,
  Star,
  TrendingUp,
  Smartphone,
  Cloud,
  Lock
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Hero from '../../components/sections/Hero';
import Features from '../../components/sections/Features';
import HowItWorks from '../../components/sections/HowItWorks';
import Testimonials from '../../components/sections/Testimonials';

const Landing = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
    // Add newsletter signup logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <Hero />
      
      {/* How It Works */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <HowItWorks />
      </section>
      
      {/* Features */}
      <section className="py-16">
        <Features />
      </section>
      
      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '40%', label: 'Reduced Wait Time', icon: TrendingUp },
              { value: '95%', label: 'Customer Satisfaction', icon: Star },
              { value: '500+', label: 'Businesses Trust Us', icon: Users },
              { value: '24/7', label: 'Support Available', icon: Shield },
            ].map((stat, index) => (
              <Card key={index} className="text-center p-6" hover>
                <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16">
        <Testimonials />
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center gradient-primary text-white p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Queue Management?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of businesses using QNow to streamline their operations and delight customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?type=business">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Start 14-Day Free Trial
                </Button>
              </Link>
              <Link to="/customer">
                <Button variant="secondary" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                  Join Queue as Customer
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm opacity-80">
              No credit card required • Cancel anytime • Full access to all features
            </p>
          </Card>
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Subscribe to our newsletter for tips, updates, and special offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:border-primary"
                required
              />
              <Button type="submit" className="whitespace-nowrap">
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Landing;