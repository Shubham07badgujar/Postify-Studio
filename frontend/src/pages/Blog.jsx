import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const Blog = () => {
  const { api } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  const categories = ['All', 'Technology', 'Design', 'Marketing', 'Business', 'Development'];

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, selectedCategory]);  const fetchPosts = async () => {
    try {
      const response = await api.get('/blog');
      // Ensure we always have an array
      const postsData = response.data?.posts || response.data || [];
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Set mock data when API fails
      const mockPosts = [
        {
          _id: '1',
          title: 'Welcome to Postify Studio Blog',
          excerpt: 'Discover the latest trends in web development, design, and digital marketing.',
          category: 'Technology',
          slug: 'welcome-to-postify-studio',
          featuredImage: 'https://via.placeholder.com/400x300',
          author: {
            name: 'Postify Team',
            avatar: 'https://via.placeholder.com/32x32'
          },
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Building Modern Web Applications',
          excerpt: 'Learn about the latest tools and techniques for building scalable web applications.',
          category: 'Development',
          slug: 'building-modern-web-apps',
          featuredImage: 'https://via.placeholder.com/400x300',
          author: {
            name: 'Development Team',
            avatar: 'https://via.placeholder.com/32x32'
          },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: '3',
          title: 'UI/UX Design Best Practices',
          excerpt: 'Essential design principles for creating user-friendly interfaces.',
          category: 'Design',
          slug: 'ui-ux-design-best-practices',
          featuredImage: 'https://via.placeholder.com/400x300',
          author: {
            name: 'Design Team',
            avatar: 'https://via.placeholder.com/32x32'
          },
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };
  const filterPosts = () => {
    // Ensure posts is always an array
    const postsArray = Array.isArray(posts) ? posts : [];
    let filtered = postsArray;

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Our Blog
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
              Insights, tips, and stories from our team. Stay updated with the latest trends
              in digital marketing and design.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  (selectedCategory === category || (selectedCategory === '' && category === 'All'))
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {!filteredPosts || filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No posts found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {loading ? 'Loading posts...' : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post._id || post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title || 'Blog post'}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                      {post.category || 'Uncategorized'}
                    </span>
                    <time dateTime={post.createdAt}>
                      {post.createdAt ? formatDate(post.createdAt) : 'Date not available'}
                    </time>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link
                      to={`/blog/${post.slug || post._id || post.id}`}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {post.title || 'Untitled'}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt || 'No excerpt available'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={post.author?.avatar || '/default-avatar.png'}
                        alt={post.author?.name || 'Author'}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="text-sm text-gray-700">{post.author?.name || 'Anonymous'}</span>
                    </div>
                    <Link
                      to={`/blog/${post.slug || post._id || post.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
