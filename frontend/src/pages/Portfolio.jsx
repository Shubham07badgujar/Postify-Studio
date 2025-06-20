import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const Portfolio = () => {
  const [filter, setFilter] = useState('all');

  const categories = [
    { id: 'all', name: 'All Projects' },
    { id: 'web', name: 'Web Development' },
    { id: 'mobile', name: 'Mobile Apps' },
    { id: 'design', name: 'UI/UX Design' },
    { id: 'branding', name: 'Branding' },
    { id: 'ecommerce', name: 'E-commerce' }
  ];

  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform',
      category: 'ecommerce',
      image: '/api/placeholder/600/400',
      description: 'A modern e-commerce platform with advanced features and seamless user experience.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      client: 'Fashion Store',
      year: '2024',
      liveUrl: '#',
      featured: true
    },
    {
      id: 2,
      title: 'Healthcare Mobile App',
      category: 'mobile',
      image: '/api/placeholder/600/400',
      description: 'A comprehensive healthcare app for appointment booking and medical records.',
      technologies: ['React Native', 'Firebase', 'Node.js'],
      client: 'MedCare Clinic',
      year: '2024',
      liveUrl: '#',
      featured: true
    },
    {
      id: 3,
      title: 'Corporate Website',
      category: 'web',
      image: '/api/placeholder/600/400',
      description: 'Professional corporate website with modern design and CMS integration.',
      technologies: ['React', 'Tailwind CSS', 'Headless CMS'],
      client: 'Tech Solutions Inc.',
      year: '2023',
      liveUrl: '#',
      featured: false
    },
    {
      id: 4,
      title: 'Restaurant Brand Identity',
      category: 'branding',
      image: '/api/placeholder/600/400',
      description: 'Complete brand identity design including logo, menu design, and marketing materials.',
      technologies: ['Adobe Illustrator', 'Photoshop', 'InDesign'],
      client: 'Bella Vista Restaurant',
      year: '2023',
      liveUrl: '#',
      featured: true
    },
    {
      id: 5,
      title: 'Task Management App',
      category: 'web',
      image: '/api/placeholder/600/400',
      description: 'A collaborative task management application with real-time updates.',
      technologies: ['Vue.js', 'Express.js', 'Socket.io', 'PostgreSQL'],
      client: 'ProductivePro',
      year: '2023',
      liveUrl: '#',
      featured: false
    },
    {
      id: 6,
      title: 'Fitness Tracker UI',
      category: 'design',
      image: '/api/placeholder/600/400',
      description: 'Modern and intuitive UI design for a fitness tracking mobile application.',
      technologies: ['Figma', 'Adobe XD', 'Principle'],
      client: 'FitLife App',
      year: '2023',
      liveUrl: '#',
      featured: false
    },
    {
      id: 7,
      title: 'Real Estate Platform',
      category: 'web',
      image: '/api/placeholder/600/400',
      description: 'Comprehensive real estate platform with property listings and virtual tours.',
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
      client: 'PropertyHub',
      year: '2024',
      liveUrl: '#',
      featured: true
    },
    {
      id: 8,
      title: 'Food Delivery App',
      category: 'mobile',
      image: '/api/placeholder/600/400',
      description: 'Full-featured food delivery app with real-time tracking and payments.',
      technologies: ['Flutter', 'Firebase', 'Google Maps API'],
      client: 'QuickEats',
      year: '2024',
      liveUrl: '#',
      featured: false
    }
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.category === filter);

  const featuredProjects = projects.filter(project => project.featured);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Portfolio
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Discover our latest projects and see how we've helped businesses transform their digital presence.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Here are some of our most successful and impactful projects.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {featuredProjects.slice(0, 4).map((project) => (
              <div key={project.id} className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <div className="flex space-x-4">
                      <button className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition duration-300">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <a 
                        href={project.liveUrl}
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition duration-300"
                      >
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600 font-medium uppercase tracking-wide">
                      {categories.find(cat => cat.id === project.category)?.name}
                    </span>
                    <span className="text-sm text-gray-500">{project.year}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    <strong>Client:</strong> {project.client}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Projects Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Browse through our complete collection of projects across different categories.
            </p>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  className={`px-6 py-2 rounded-full transition duration-300 ${
                    filter === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div key={project.id} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <div className="flex space-x-3">
                      <button className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition duration-300">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <a 
                        href={project.liveUrl}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                      {categories.find(cat => cat.id === project.category)?.name}
                    </span>
                    <span className="text-xs text-gray-500">{project.year}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-gray-500 text-xs">+{project.technologies.length - 3}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    <strong>Client:</strong> {project.client}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let's create something amazing together. Get in touch to discuss your project requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quote-request"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              Get Free Quote
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
