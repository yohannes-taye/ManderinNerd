import { useState, useEffect } from "react";
import axios from "../config/axios";
import "./BlogsListPage.css";

function BlogsListPage({ onSelectBlog }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        console.log('Fetching blogs list...');
        const response = await axios.get('/blogs');
        console.log('Successfully fetched blogs:', response.data);
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Unable to load blogs. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleBlogSelect = (blogId) => {
    if (onSelectBlog) {
      onSelectBlog(blogId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blogs-list-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-list-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="blogs-list-page">
      <header className="blogs-header">
        <h1>Choose an Article</h1>
        <p>Select an article to start learning Mandarin</p>
      </header>

      <div className="blogs-container">
        {blogs.length === 0 ? (
          <div className="no-blogs">
            <h3>No articles available</h3>
            <p>There are currently no articles available. Please check back later.</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <div key={blog.id} className="blog-card" onClick={() => handleBlogSelect(blog.id)}>
                {blog.image_url && (
                  <div className="blog-card-image">
                    <img 
                      src={blog.image_url} 
                      alt={blog.image_alt || blog.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="blog-card-header">
                  <h3>{blog.title}</h3>
                  <span className="blog-date">{formatDate(blog.created_at)}</span>
                </div>
                <div className="blog-card-content">
                  <p className="blog-preview">
                    {blog.text && blog.text.length > 150 
                      ? `${blog.text.substring(0, 150)}...` 
                      : blog.text || 'No preview available'
                    }
                  </p>
                  <div className="blog-stats">
                    <span className="word-count">
                      {blog.tokens ? `${blog.tokens.length} words` : 'Unknown word count'}
                    </span>
                  </div>
                </div>
                <div className="blog-card-footer">
                  <button className="read-button">Read Article →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogsListPage;
