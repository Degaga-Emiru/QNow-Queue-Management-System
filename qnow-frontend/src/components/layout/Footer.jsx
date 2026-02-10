import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'API', href: '/api' },
      { label: 'Documentation', href: '/docs' },
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
    Resources: [
      { label: 'Help Center', href: '/help' },
      { label: 'Community', href: '/community' },
      { label: 'Contact', href: '/contact' },
      { label: 'Status', href: '/status' },
    ],
    Legal: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '/security' },
      { label: 'Cookies', href: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="text-2xl font-bold text-white">QNow</span>
            </div>
            <p className="mb-6 max-w-md">
              Transforming waiting experiences with smart queue management solutions for businesses worldwide.
            </p>
            
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-800 grid md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-primary" />
            <span>support@qnow.com</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-primary" />
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-primary" />
            <span>123 Business St, San Francisco, CA</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0">
            © {currentYear} QNow. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4">
            <p className="text-sm">
              Made with <Heart className="w-4 h-4 text-red-500 inline" /> for better queues
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">v1.0.0</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-green-500">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;