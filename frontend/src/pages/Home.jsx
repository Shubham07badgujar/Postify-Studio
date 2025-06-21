import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  PaintBrushIcon,
  MegaphoneIcon,
  ChartBarIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserPlusIcon,
  RocketLaunchIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const services = [
    {
      icon: CodeBracketIcon,
      title: 'Web Development',
      description: 'Custom websites and web applications built with modern technologies.'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Apps',
      description: 'Native and cross-platform mobile applications for iOS and Android.'
    },
    {
      icon: PaintBrushIcon,
      title: 'UI/UX Design',
      description: 'Beautiful and intuitive user interfaces that engage your audience.'
    },
    {
      icon: MegaphoneIcon,
      title: 'Digital Marketing',
      description: 'Comprehensive digital marketing strategies to grow your business.'
    },
    {
      icon: ChartBarIcon,
      title: 'SEO Services',
      description: 'Improve your search engine rankings and drive organic traffic.'
    },
    {
      icon: SparklesIcon,
      title: 'Branding',
      description: 'Create a memorable brand identity that resonates with your audience.'
    }
  ];

  const features = [
    'Expert team of developers and designers',
    '24/7 customer support',
    'Agile development methodology',
    'Competitive pricing',
    'On-time delivery guarantee',
    'Post-launch maintenance and support'
  ];

  const stats = [
    { number: '100+', label: 'Projects Completed' },
    { number: '50+', label: 'Happy Clients' },
    { number: '3+', label: 'Years Experience' },
    { number: '99%', label: 'Client Satisfaction' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Your Digital Presence
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              We create stunning websites, mobile apps, and digital solutions that help your business grow and succeed in the digital world.
            </p>            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 inline-flex items-center justify-center transform hover:scale-105 shadow-lg"
              >
                <UserPlusIcon className="mr-2 h-5 w-5" />
                Get Started Free
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/quote-request"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition duration-300 inline-flex items-center justify-center transform hover:scale-105 shadow-lg"
              >
                <RocketLaunchIcon className="mr-2 h-5 w-5" />
                Get Free Quote
              </Link>
              <Link
                to="/portfolio"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300 transform hover:scale-105"
              >
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join hundreds of satisfied clients who have transformed their digital presence with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Your Account</h3>
              <p className="text-gray-600 mb-6">
                Sign up for free and choose your account type. Join our community of innovators and creators.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition duration-300 inline-flex items-center"
                >
                  <UserPlusIcon className="mr-2 h-5 w-5" />
                  Sign Up Now
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Your Vision</h3>
              <p className="text-gray-600 mb-6">
                Tell us about your project goals, requirements, and timeline. We'll help bring your ideas to life.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/quote-request"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition duration-300 inline-flex items-center"
                >
                  <SparklesIcon className="mr-2 h-5 w-5" />
                  Request Quote
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Launch & Grow</h3>
              <p className="text-gray-600 mb-6">
                Watch your digital presence come to life. We'll support you every step of the way to success.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/portfolio"
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-teal-700 transition duration-300 inline-flex items-center"
                >
                  <RocketLaunchIcon className="mr-2 h-5 w-5" />
                  See Results
                </Link>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h3>
              <div className="flex justify-center items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-gray-600 font-medium">4.9/5 from 100+ reviews</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">100+</div>
                <div className="text-gray-600">Projects Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-gray-600">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">99%</div>
                <div className="text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We offer a comprehensive range of digital services to help your business thrive online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                <div className="flex items-center mb-4">
                  <service.icon className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                </div>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Postify Studio?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We combine creativity, technology, and strategy to deliver exceptional digital solutions that drive results for your business.
              </p>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img
                src="/api/placeholder/600/400"
                alt="Team working"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500 rounded-full opacity-10"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-500 rounded-full opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500 rounded-full opacity-5"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Digital Presence?
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Join our community of successful businesses and start your digital transformation journey today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Link
              to="/register"
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-teal-700 transition duration-300 inline-flex items-center justify-center transform hover:scale-105 shadow-2xl"
            >
              <UserPlusIcon className="mr-3 h-6 w-6" />
              Start Free Today
              <ArrowRightIcon className="ml-3 h-6 w-6" />
            </Link>
            
            <Link
              to="/quote-request"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition duration-300 inline-flex items-center justify-center transform hover:scale-105 shadow-2xl"
            >
              <RocketLaunchIcon className="mr-3 h-6 w-6" />
              Request Quote
            </Link>
            
            <Link
              to="/contact"
              className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 transition duration-300 transform hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm opacity-80">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <span>No Setup Fees</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <span>30-Day Money Back</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
