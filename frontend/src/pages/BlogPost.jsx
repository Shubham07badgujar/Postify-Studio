import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, UserIcon, TagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import axios from 'axios';

const BlogPost = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/blog/${slug}`);
      setPost(response.data.post);
      fetchRelatedPosts(response.data.post.category, response.data.post._id);
    } catch (error) {
      console.error('Error fetching post:', error);
      if (error.response?.status === 404) {
        navigate('/blog');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category, currentPostId) => {
    try {
      const response = await axios.get(`/api/blog?category=${category}&limit=3`);
      const filtered = response.data.posts.filter(p => p._id !== currentPostId);
      setRelatedPosts(filtered.slice(0, 3));
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Post not found</h2>
          <Link
            to="/blog"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </button>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="mb-4">
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {post.excerpt}
          </p>
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2" />
              <img
                src={post.author.avatar || '/default-avatar.png'}
                alt={post.author.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </div>
            <div className="flex items-center">
              <TagIcon className="h-4 w-4 mr-2" />
              <span>{post.readTime || '5'} min read</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
            />
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="text-gray-900 leading-relaxed"
          />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="border-t border-gray-200 pt-8 mb-12">
          <div className="flex items-start space-x-4">
            <img
              src={post.author.avatar || '/default-avatar.png'}
              alt={post.author.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {post.author.name}
              </h3>
              <p className="text-gray-600 mt-1">
                {post.author.bio || 'Author and content creator at Postify Studio.'}
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {relatedPost.featuredImage && (
                    <img
                      src={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                        {relatedPost.category}
                      </span>
                      <time dateTime={relatedPost.createdAt}>
                        {formatDate(relatedPost.createdAt)}
                      </time>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Link
                        to={`/blog/${relatedPost.slug}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <Link
                      to={`/blog/${relatedPost.slug}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
