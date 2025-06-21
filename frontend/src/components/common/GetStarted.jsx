import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlusIcon,
  RocketLaunchIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const GetStarted = () => {
  const benefits = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: ClockIcon,
      title: 'Fast Delivery',
      description: 'Get your project completed on time, every time'
    },
    {
      icon: HeartIcon,
      title: '24/7 Support',
      description: 'Our team is always here to help you succeed'
    },
    {
      icon: SparklesIcon,
      title: 'Premium Quality',
      description: 'High-quality solutions that exceed expectations'
    }
  ];

  const steps = [
    {
      step: 1,
      title: 'Create Account',
      description: 'Sign up for free and choose your account type',
      action: 'Sign Up',
      link: '/register',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      step: 2,
      title: 'Share Your Vision',
      description: 'Tell us about your project and requirements',
      action: 'Get Quote',
      link: '/quote-request',
      color: 'from-purple-500 to-pink-600'
    },
    {
      step: 3,
      title: 'Launch & Grow',
      description: 'Watch your digital presence come to life',
      action: 'View Portfolio',
      link: '/portfolio',
      color: 'from-green-500 to-teal-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <SparklesIcon className="h-16 w-16 text-indigo-600 mx-auto mb-6" />
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Ready to Get Started?
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
                Join hundreds of successful businesses who have transformed their digital presence with our expert team.
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex justify-center items-center space-x-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600 font-medium">4.9/5 from 100+ reviews</span>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 inline-flex items-center justify-center transform hover:scale-105 shadow-xl"
              >
                <UserPlusIcon className="mr-3 h-6 w-6" />
                Start Free Today
                <ArrowRightIcon className="ml-3 h-6 w-6" />
              </Link>
              
              <Link
                to="/quote-request"
                className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 hover:text-white transition duration-300 inline-flex items-center justify-center transform hover:scale-105"
              >
                <RocketLaunchIcon className="mr-3 h-6 w-6" />
                Get Free Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Postify Studio?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to delivering exceptional results that drive your business forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our streamlined process makes it easy to bring your vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 z-0"></div>
                )}
                
                <div className="relative z-10">
                  <div className={`bg-gradient-to-r ${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg`}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  <Link
                    to={step.link}
                    className={`bg-gradient-to-r ${step.color} text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition duration-300 inline-flex items-center`}
                  >
                    {step.action}
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community today and start your journey to digital success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-teal-700 transition duration-300 inline-flex items-center justify-center transform hover:scale-105 shadow-xl"
            >
              <UserPlusIcon className="mr-2 h-5 w-5" />
              Get Started Free
            </Link>
            
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-gray-900 transition duration-300 transform hover:scale-105"
            >
              Contact Us
            </Link>
          </div>

          <div className="mt-8 flex justify-center items-center space-x-6 text-sm opacity-80">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <span>No Setup Fees</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <span>Free Consultation</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <span>Money Back Guarantee</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GetStarted;
