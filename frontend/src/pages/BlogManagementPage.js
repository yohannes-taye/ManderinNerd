import { useState, useEffect } from "react";
import "./BlogManagementPage.css";

function BlogManagementPage({ onNavigateBack }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBlog, setEditingBlog] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", text: "", tokens: [] });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Token editing states
  const [currentToken, setCurrentToken] = useState({ text: "", pinyin: "", meaning: "" });
  const [editingToken, setEditingToken] = useState(null);
  const [editToken, setEditToken] = useState({ text: "", pinyin: "", meaning: "" });
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [constructSentence, setConstructSentence] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const getApiUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return process.env.REACT_APP_API_URL || 'http://68.183.250.107:5000';
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/blogs`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blogsData = await response.json();
      setBlogs(blogsData);
      setError("");
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog.id);
    setEditForm({
      title: blog.title,
      text: blog.text,
      tokens: blog.tokens || []
    });
    // Reset token editing states
    setCurrentToken({ text: "", pinyin: "", meaning: "" });
    setEditingToken(null);
    setEditToken({ text: "", pinyin: "", meaning: "" });
    setJsonInput("");
    setJsonError("");
    setConstructSentence(true);
  };

  const handleEditSave = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/blogs/${editingBlog}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the blogs list
      await fetchBlogs();
      setEditingBlog(null);
      setEditForm({ title: "", text: "", tokens: [] });
    } catch (err) {
      console.error('Error updating blog:', err);
      setError('Failed to update blog. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setEditingBlog(null);
    setEditForm({ title: "", text: "", tokens: [] });
    // Reset token editing states
    setCurrentToken({ text: "", pinyin: "", meaning: "" });
    setEditingToken(null);
    setEditToken({ text: "", pinyin: "", meaning: "" });
    setJsonInput("");
    setJsonError("");
    setConstructSentence(true);
  };

  // Token management functions
  const addToken = () => {
    if (currentToken.text && currentToken.pinyin && currentToken.meaning) {
      setEditForm({
        ...editForm,
        tokens: [...editForm.tokens, { ...currentToken }]
      });
      setCurrentToken({ text: "", pinyin: "", meaning: "" });
    }
  };

  const removeToken = (index) => {
    setEditForm({
      ...editForm,
      tokens: editForm.tokens.filter((_, i) => i !== index)
    });
  };

  const startEditing = (index) => {
    setEditingToken(index);
    setEditToken({ ...editForm.tokens[index] });
  };

  const saveEdit = (index) => {
    if (editToken.text && editToken.pinyin && editToken.meaning) {
      const updatedTokens = [...editForm.tokens];
      updatedTokens[index] = { ...editToken };
      setEditForm({
        ...editForm,
        tokens: updatedTokens
      });
      setEditingToken(null);
      setEditToken({ text: "", pinyin: "", meaning: "" });
    }
  };

  const cancelEdit = () => {
    setEditingToken(null);
    setEditToken({ text: "", pinyin: "", meaning: "" });
  };

  const parseJsonTokens = () => {
    setJsonError("");
    
    if (!jsonInput.trim()) {
      setJsonError("Please enter JSON data");
      return;
    }

    try {
      const parsedTokens = JSON.parse(jsonInput);
      
      // Validate that it's an array
      if (!Array.isArray(parsedTokens)) {
        setJsonError("JSON must be an array of token objects");
        return;
      }

      // Validate each token has required fields
      const validTokens = parsedTokens.filter(token => {
        return token && 
               typeof token.text === 'string' && 
               typeof token.pinyin === 'string' && 
               typeof token.meaning === 'string' &&
               token.text.trim() && 
               token.pinyin.trim() && 
               token.meaning.trim();
      });

      if (validTokens.length === 0) {
        setJsonError("No valid tokens found. Each token must have 'text', 'pinyin', and 'meaning' fields");
        return;
      }

      if (validTokens.length !== parsedTokens.length) {
        setJsonError(`Only ${validTokens.length} out of ${parsedTokens.length} tokens are valid. Invalid tokens were skipped.`);
      }

      // Add valid tokens to existing tokens
      setEditForm({
        ...editForm,
        tokens: [...editForm.tokens, ...validTokens]
      });
      
      // Construct sentence from imported tokens and populate text field (if enabled)
      if (constructSentence) {
        const constructedSentence = validTokens.map(token => token.text).join('');
        if (constructedSentence) {
          setEditForm(prev => ({
            ...prev,
            text: prev.text ? `${prev.text}${constructedSentence}` : constructedSentence
          }));
        }
      }
      
      setJsonInput("");
      setJsonError("");
      
    } catch (err) {
      setJsonError(`Invalid JSON format: ${err.message}`);
    }
  };

  const clearJsonInput = () => {
    setJsonInput("");
    setJsonError("");
  };

  const handleDelete = async (blogId) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/blogs/${blogId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the blogs list
      await fetchBlogs();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting blog:', err);
      setError('Failed to delete blog. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="blog-management-page">
        <header className="blog-management-header">
          <button onClick={onNavigateBack}>{"< Back"}</button>
          <h2>Manage Blogs</h2>
        </header>
        <div className="loading">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="blog-management-page">
      {/* Header */}
      <header className="blog-management-header">
        <button onClick={onNavigateBack}>{"< Back"}</button>
        <h2>Manage Blogs</h2>
        <div className="blog-count">
          📊 {blogs.length} blog{blogs.length !== 1 ? 's' : ''}
        </div>
      </header>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Main Content */}
      <div className="blog-management-content">
        {blogs.length === 0 ? (
          <div className="no-blogs">
            <div className="no-blogs-icon">📝</div>
            <h3>No blogs found</h3>
            <p>Create your first blog to get started!</p>
          </div>
        ) : (
          <div className="blogs-list">
            {blogs.map((blog) => (
              <div key={blog.id} className="blog-card">
                {editingBlog === blog.id ? (
                  // Edit Mode
                  <div className="blog-edit-form">
                    <div className="form-group">
                      <label>Title:</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="edit-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Chinese Text:</label>
                      <textarea
                        value={editForm.text}
                        onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                        className="edit-textarea"
                        rows="4"
                      />
                    </div>

                    {/* Token Management */}
                    <div className="form-group">
                      <div className="token-header">
                        <label>Vocabulary Tokens:</label>
                        <span className="token-counter">
                          📊 {editForm.tokens.length} token{editForm.tokens.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {/* JSON Import Section */}
                      <div className="json-import-section">
                        <label htmlFor="json-input" className="json-import-label">
                          📋 Import from JSON Array:
                        </label>
                        <div className="json-input-container">
                          <textarea
                            id="json-input"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder="Paste your JSON array here...&#10;&#10;Example:&#10;[&#10;  {&quot;text&quot;: &quot;中国&quot;, &quot;pinyin&quot;: &quot;zhōng guó&quot;, &quot;meaning&quot;: &quot;China&quot;},&#10;  {&quot;text&quot;: &quot;茶&quot;, &quot;pinyin&quot;: &quot;chá&quot;, &quot;meaning&quot;: &quot;tea&quot;},&#10;  {&quot;text&quot;: &quot;文化&quot;, &quot;pinyin&quot;: &quot;wén huà&quot;, &quot;meaning&quot;: &quot;culture&quot;},&#10;  {&quot;text&quot;: &quot;几千年&quot;, &quot;pinyin&quot;: &quot;jǐ qiān nián&quot;, &quot;meaning&quot;: &quot;thousands of years&quot;},&#10;  {&quot;text&quot;: &quot;历史&quot;, &quot;pinyin&quot;: &quot;lì shǐ&quot;, &quot;meaning&quot;: &quot;history&quot;}&#10;]&#10;&#10;Note: Each object must have 'text', 'pinyin', and 'meaning' fields."
                            rows="6"
                            className="json-textarea"
                          />
                          <div className="json-options">
                            <label className="json-checkbox-label">
                              <input
                                type="checkbox"
                                checked={constructSentence}
                                onChange={(e) => setConstructSentence(e.target.checked)}
                                className="json-checkbox"
                              />
                              <span className="checkbox-text">Construct sentence from tokens</span>
                            </label>
                          </div>
                          <div className="json-buttons">
                            <button 
                              type="button" 
                              onClick={parseJsonTokens} 
                              className="parse-json-btn"
                              disabled={!jsonInput.trim()}
                            >
                              📥 Import Tokens
                            </button>
                            <button 
                              type="button" 
                              onClick={clearJsonInput} 
                              className="clear-json-btn"
                              disabled={!jsonInput.trim()}
                            >
                              🗑️ Clear
                            </button>
                          </div>
                        </div>
                        {jsonError && <div className="json-error">{jsonError}</div>}
                      </div>
                      
                      {/* Add Token Form */}
                      <div className="token-input">
                        <input
                          type="text"
                          placeholder="Chinese character/word"
                          value={currentToken.text}
                          onChange={(e) => setCurrentToken({...currentToken, text: e.target.value})}
                        />
                        <input
                          type="text"
                          placeholder="Pinyin"
                          value={currentToken.pinyin}
                          onChange={(e) => setCurrentToken({...currentToken, pinyin: e.target.value})}
                        />
                        <input
                          type="text"
                          placeholder="Meaning"
                          value={currentToken.meaning}
                          onChange={(e) => setCurrentToken({...currentToken, meaning: e.target.value})}
                        />
                        <button type="button" onClick={addToken} className="add-token-btn">
                          Add Token
                        </button>
                      </div>

                      {/* Token List */}
                      <div className="token-list">
                        {editForm.tokens.map((token, index) => (
                          <div key={index} className="token-item">
                            {editingToken === index ? (
                              // Edit Mode
                              <div className="token-edit">
                                <input
                                  type="text"
                                  value={editToken.text}
                                  onChange={(e) => setEditToken({...editToken, text: e.target.value})}
                                  className="edit-input"
                                  placeholder="Chinese text"
                                />
                                <input
                                  type="text"
                                  value={editToken.pinyin}
                                  onChange={(e) => setEditToken({...editToken, pinyin: e.target.value})}
                                  className="edit-input"
                                  placeholder="Pinyin"
                                />
                                <input
                                  type="text"
                                  value={editToken.meaning}
                                  onChange={(e) => setEditToken({...editToken, meaning: e.target.value})}
                                  className="edit-input"
                                  placeholder="Meaning"
                                />
                                <div className="edit-buttons">
                                  <button 
                                    type="button" 
                                    onClick={() => saveEdit(index)}
                                    className="save-edit-btn"
                                  >
                                    ✓
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={cancelEdit}
                                    className="cancel-edit-btn"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Display Mode
                              <>
                                <span className="token-text">{token.text}</span>
                                <span className="token-pinyin">({token.pinyin})</span>
                                <span className="token-meaning">→ {token.meaning}</span>
                                <div className="token-actions">
                                  <button 
                                    type="button" 
                                    onClick={() => startEditing(index)}
                                    className="edit-token-btn"
                                    title="Edit token"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => removeToken(index)}
                                    className="remove-token-btn"
                                    title="Remove token"
                                  >
                                    ×
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="edit-actions">
                      <button onClick={handleEditSave} className="save-btn">
                        💾 Save
                      </button>
                      <button onClick={handleEditCancel} className="cancel-btn">
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <>
                    <div className="blog-header">
                      <h3 className="blog-title">{blog.title}</h3>
                      <div className="blog-meta">
                        <span className="blog-date">
                          📅 {formatDate(blog.created_at)}
                        </span>
                        <span className="blog-tokens">
                          🏷️ {blog.tokens?.length || 0} tokens
                        </span>
                      </div>
                    </div>
                    
                    <div className="blog-content">
                      <p className="blog-text">{truncateText(blog.text)}</p>
                      
                      {blog.tokens && blog.tokens.length > 0 && (
                        <div className="blog-tokens-preview">
                          <strong>Vocabulary:</strong>
                          <div className="tokens-list">
                            {blog.tokens.slice(0, 5).map((token, index) => (
                              <span key={index} className="token-item">
                                {token.text} ({token.pinyin}) → {token.meaning}
                              </span>
                            ))}
                            {blog.tokens.length > 5 && (
                              <span className="more-tokens">
                                +{blog.tokens.length - 5} more...
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="blog-actions">
                      <button 
                        onClick={() => handleEdit(blog)}
                        className="edit-btn"
                        title="Edit blog"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(blog.id)}
                        className="delete-btn"
                        title="Delete blog"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this blog? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={() => handleDelete(showDeleteConfirm)}
                className="confirm-delete-btn"
              >
                🗑️ Delete
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="cancel-delete-btn"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <footer className="blog-management-footer">
        <button onClick={onNavigateBack}>📖 Back to Lesson</button>
        <button onClick={fetchBlogs}>🔄 Refresh</button>
      </footer>
    </div>
  );
}

export default BlogManagementPage;
