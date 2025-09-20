import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = ({ onNavigateBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [activationCodes, setActivationCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', is_admin: false });
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  
  // Blog creation and editing states
  const [showCreateBlogForm, setShowCreateBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [newBlog, setNewBlog] = useState({ title: '', text: '', tokens: [] });
  const [editBlog, setEditBlog] = useState({ title: '', text: '', tokens: [] });
  const [currentToken, setCurrentToken] = useState({ text: '', pinyin: '', meaning: '' });
  const [editingToken, setEditingToken] = useState(null);
  const [editToken, setEditToken] = useState({ text: '', pinyin: '', meaning: '' });
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [constructSentence, setConstructSentence] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'blogs') fetchBlogs();
    if (activeTab === 'codes') fetchActivationCodes();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch statistics');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/blogs');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivationCodes = async () => {
    try {
      const response = await axios.get('/admin/activation-codes');
      setActivationCodes(response.data.codes);
    } catch (error) {
      console.error('Error fetching activation codes:', error);
      toast.error('Failed to fetch activation codes');
    }
  };

  const generateActivationCode = async () => {
    try {
      const response = await axios.get('/admin/generate-code');
      toast.success('Activation code generated!');
      fetchActivationCodes();
    } catch (error) {
      console.error('Error generating activation code:', error);
      toast.error('Failed to generate activation code');
    }
  };

  const deleteActivationCode = async (code) => {
    try {
      await axios.delete(`/admin/activation-codes/${code}`);
      toast.success('Activation code deleted');
      fetchActivationCodes();
    } catch (error) {
      console.error('Error deleting activation code:', error);
      toast.error('Failed to delete activation code');
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      await axios.put(`/admin/users/${userId}`, updates);
      toast.success('User updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/users', newUser);
      toast.success('User created successfully');
      setNewUser({ email: '', password: '', is_admin: false });
      setShowNewUserForm(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const deleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      await axios.delete(`/admin/blogs/${blogId}`);
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  // Blog creation and editing functions
  const handleCreateBlog = () => {
    setShowCreateBlogForm(true);
    setNewBlog({ title: '', text: '', tokens: [] });
    setCurrentToken({ text: '', pinyin: '', meaning: '' });
    setEditingToken(null);
    setEditToken({ text: '', pinyin: '', meaning: '' });
    setJsonInput('');
    setJsonError('');
    setConstructSentence(true);
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog.id);
    setEditBlog({
      title: blog.title,
      text: blog.text,
      tokens: blog.tokens || []
    });
    setCurrentToken({ text: '', pinyin: '', meaning: '' });
    setEditingToken(null);
    setEditToken({ text: '', pinyin: '', meaning: '' });
    setJsonInput('');
    setJsonError('');
    setConstructSentence(true);
  };

  const handleCancelCreate = () => {
    setShowCreateBlogForm(false);
    setNewBlog({ title: '', text: '', tokens: [] });
    setCurrentToken({ text: '', pinyin: '', meaning: '' });
    setEditingToken(null);
    setEditToken({ text: '', pinyin: '', meaning: '' });
    setJsonInput('');
    setJsonError('');
    setConstructSentence(true);
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
    setEditBlog({ title: '', text: '', tokens: [] });
    setCurrentToken({ text: '', pinyin: '', meaning: '' });
    setEditingToken(null);
    setEditToken({ text: '', pinyin: '', meaning: '' });
    setJsonInput('');
    setJsonError('');
    setConstructSentence(true);
  };

  // Token management functions
  const addToken = (isEdit = false) => {
    if (currentToken.text && currentToken.pinyin && currentToken.meaning) {
      if (isEdit) {
        const newTokens = [...editBlog.tokens, { ...currentToken }];
        const constructedSentence = newTokens.map(token => token.text).join('');
        setEditBlog({
          ...editBlog,
          tokens: newTokens,
          text: constructedSentence
        });
      } else {
        const newTokens = [...newBlog.tokens, { ...currentToken }];
        const constructedSentence = newTokens.map(token => token.text).join('');
        setNewBlog({
          ...newBlog,
          tokens: newTokens,
          text: constructedSentence
        });
      }
      setCurrentToken({ text: '', pinyin: '', meaning: '' });
    }
  };

  const removeToken = (index, isEdit = false) => {
    if (isEdit) {
      const newTokens = editBlog.tokens.filter((_, i) => i !== index);
      const constructedSentence = newTokens.map(token => token.text).join('');
      setEditBlog({
        ...editBlog,
        tokens: newTokens,
        text: constructedSentence
      });
    } else {
      const newTokens = newBlog.tokens.filter((_, i) => i !== index);
      const constructedSentence = newTokens.map(token => token.text).join('');
      setNewBlog({
        ...newBlog,
        tokens: newTokens,
        text: constructedSentence
      });
    }
  };

  const startEditingToken = (index, isEdit = false) => {
    setEditingToken(index);
    const tokens = isEdit ? editBlog.tokens : newBlog.tokens;
    setEditToken({ ...tokens[index] });
  };

  const saveTokenEdit = (index, isEdit = false) => {
    if (editToken.text && editToken.pinyin && editToken.meaning) {
      if (isEdit) {
        const updatedTokens = [...editBlog.tokens];
        updatedTokens[index] = { ...editToken };
        const newTokens = updatedTokens;
        const constructedSentence = newTokens.map(token => token.text).join('');
        setEditBlog({
          ...editBlog,
          tokens: updatedTokens,
          text: constructedSentence
        });
      } else {
        const updatedTokens = [...newBlog.tokens];
        updatedTokens[index] = { ...editToken };
        const newTokens = updatedTokens;
        const constructedSentence = newTokens.map(token => token.text).join('');
        setNewBlog({
          ...newBlog,
          tokens: updatedTokens,
          text: constructedSentence
        });
      }
      setEditingToken(null);
      setEditToken({ text: '', pinyin: '', meaning: '' });
    }
  };

  const cancelTokenEdit = () => {
    setEditingToken(null);
    setEditToken({ text: '', pinyin: '', meaning: '' });
  };

  const parseJsonTokens = (isEdit = false) => {
    setJsonError('');
    
    if (!jsonInput.trim()) {
      setJsonError('Please enter JSON data');
      return;
    }

    try {
      const parsedTokens = JSON.parse(jsonInput);
      
      if (!Array.isArray(parsedTokens)) {
        setJsonError('JSON must be an array of token objects');
        return;
      }

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
        setJsonError('No valid tokens found. Each token must have \'text\', \'pinyin\', and \'meaning\' fields');
        return;
      }

      if (validTokens.length !== parsedTokens.length) {
        setJsonError(`Only ${validTokens.length} out of ${parsedTokens.length} tokens are valid. Invalid tokens were skipped.`);
      }

      if (isEdit) {
        const newTokens = [...editBlog.tokens, ...validTokens];
        const constructedSentence = newTokens.map(token => token.text).join('');
        setEditBlog({
          ...editBlog,
          tokens: newTokens,
          text: constructedSentence
        });
      } else {
        const newTokens = [...newBlog.tokens, ...validTokens];
        const constructedSentence = newTokens.map(token => token.text).join('');
        setNewBlog({
          ...newBlog,
          tokens: newTokens,
          text: constructedSentence
        });
      }
      
      setJsonInput('');
      setJsonError('');
      
    } catch (err) {
      setJsonError(`Invalid JSON format: ${err.message}`);
    }
  };

  const clearJsonInput = () => {
    setJsonInput('');
    setJsonError('');
  };

  const handleCreateBlogSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('/blogs', newBlog);
      toast.success('Blog created successfully');
      setShowCreateBlogForm(false);
      setNewBlog({ title: '', text: '', tokens: [] });
      setCurrentToken({ text: '', pinyin: '', meaning: '' });
      setEditingToken(null);
      setEditToken({ text: '', pinyin: '', meaning: '' });
      setJsonInput('');
      setJsonError('');
      setConstructSentence(true);
      fetchBlogs();
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBlogSubmit = async () => {
    try {
      await axios.put(`/blogs/${editingBlog}`, editBlog);
      toast.success('Blog updated successfully');
      setEditingBlog(null);
      setEditBlog({ title: '', text: '', tokens: [] });
      setCurrentToken({ text: '', pinyin: '', meaning: '' });
      setEditingToken(null);
      setEditToken({ text: '', pinyin: '', meaning: '' });
      setJsonInput('');
      setJsonError('');
      setConstructSentence(true);
      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update blog');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={() => window.location.href = '/'} className="back-button">
          ← Back to App
        </button>
      </header>

      <div className="admin-content">
        <nav className="admin-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'blogs' ? 'active' : ''} 
            onClick={() => setActiveTab('blogs')}
          >
            Blogs
          </button>
          <button 
            className={activeTab === 'codes' ? 'active' : ''} 
            onClick={() => setActiveTab('codes')}
          >
            Activation Codes
          </button>
        </nav>

        <div className="admin-main">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Blogs</h3>
                  <p className="stat-number">{stats.totalBlogs || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Admins</h3>
                  <p className="stat-number">{stats.totalAdmins || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Active Codes</h3>
                  <p className="stat-number">{stats.activeActivationCodes || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h2>User Management</h2>
                <button 
                  className="add-button"
                  onClick={() => setShowNewUserForm(!showNewUserForm)}
                >
                  Add User
                </button>
              </div>

              {showNewUserForm && (
                <form className="new-user-form" onSubmit={createUser}>
                  <h3>Create New User</h3>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password:</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newUser.is_admin}
                        onChange={(e) => setNewUser({...newUser, is_admin: e.target.checked})}
                      />
                      Admin User
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="submit">Create User</button>
                    <button type="button" onClick={() => setShowNewUserForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Admin</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5">Loading...</td></tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id}>
                          <td>{user.email}</td>
                          <td>
                            <span className={`status ${user.is_activated ? 'active' : 'inactive'}`}>
                              {user.is_activated ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <span className={`admin ${user.is_admin ? 'yes' : 'no'}`}>
                              {user.is_admin ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>{formatDate(user.created_at)}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                onClick={() => updateUser(user.id, { is_activated: !user.is_activated })}
                                className="toggle-button"
                              >
                                {user.is_activated ? 'Deactivate' : 'Activate'}
                              </button>
                              <button 
                                onClick={() => updateUser(user.id, { is_admin: !user.is_admin })}
                                className="admin-button"
                              >
                                {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                              </button>
                              <button 
                                onClick={() => deleteUser(user.id)}
                                className="delete-button"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="blogs-section">
              <div className="section-header">
                <h2>Blog Management</h2>
                <button 
                  className="add-button"
                  onClick={handleCreateBlog}
                >
                  Create Blog
                </button>
              </div>

              {showCreateBlogForm && (
                <div className="create-blog-form">
                  <h3>Create New Blog</h3>
                  <form onSubmit={handleCreateBlogSubmit}>
                    <div className="form-group">
                      <label>Title:</label>
                      <input
                        type="text"
                        value={newBlog.title}
                        onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Chinese Text:</label>
                      <textarea
                        value={newBlog.text}
                        onChange={(e) => setNewBlog({...newBlog, text: e.target.value})}
                        rows="6"
                        required
                      />
                    </div>

                    {/* Token Management */}
                    <div className="form-group">
                      <div className="token-header">
                        <label>Vocabulary Tokens:</label>
                        <span className="token-counter">
                          📊 {newBlog.tokens.length} token{newBlog.tokens.length !== 1 ? 's' : ''}
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
                            placeholder="Paste your JSON array here..."
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
                              onClick={() => parseJsonTokens(false)} 
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
                        <button type="button" onClick={() => addToken(false)} className="add-token-btn">
                          Add Token
                        </button>
                      </div>

                      {/* Token List */}
                      <div className="token-list">
                        {newBlog.tokens.map((token, index) => (
                          <div key={index} className="token-item">
                            {editingToken === index ? (
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
                                    onClick={() => saveTokenEdit(index, false)}
                                    className="save-edit-btn"
                                  >
                                    ✓
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={cancelTokenEdit}
                                    className="cancel-edit-btn"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="token-text">{token.text}</span>
                                <span className="token-pinyin">({token.pinyin})</span>
                                <span className="token-meaning">→ {token.meaning}</span>
                                <div className="token-actions">
                                  <button 
                                    type="button" 
                                    onClick={() => startEditingToken(index, false)}
                                    className="edit-token-btn"
                                    title="Edit token"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => removeToken(index, false)}
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

                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isSubmitting || !newBlog.title || !newBlog.text || newBlog.tokens.length === 0}
                      >
                        {isSubmitting ? "Creating..." : "Create Blog"}
                      </button>
                      <button 
                        type="button" 
                        onClick={handleCancelCreate}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="blogs-list">
                {loading ? (
                  <div className="loading">Loading blogs...</div>
                ) : (
                  blogs.map(blog => (
                    <div key={blog.id} className="blog-card">
                      {editingBlog === blog.id ? (
                        // Edit Mode - Full Form
                        <div className="blog-edit-form">
                          <h3>Edit Blog</h3>
                          <div className="form-group">
                            <label>Title:</label>
                            <input
                              type="text"
                              value={editBlog.title}
                              onChange={(e) => setEditBlog({...editBlog, title: e.target.value})}
                              className="edit-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Chinese Text:</label>
                            <textarea
                              value={editBlog.text}
                              onChange={(e) => setEditBlog({...editBlog, text: e.target.value})}
                              className="edit-textarea"
                              rows="4"
                            />
                          </div>

                          {/* Token Management */}
                          <div className="form-group">
                            <div className="token-header">
                              <label>Vocabulary Tokens:</label>
                              <span className="token-counter">
                                📊 {editBlog.tokens.length} token{editBlog.tokens.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            {/* JSON Import Section */}
                            <div className="json-import-section">
                              <label htmlFor="json-input-edit" className="json-import-label">
                                📋 Import from JSON Array:
                              </label>
                              <div className="json-input-container">
                                <textarea
                                  id="json-input-edit"
                                  value={jsonInput}
                                  onChange={(e) => setJsonInput(e.target.value)}
                                  placeholder="Paste your JSON array here..."
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
                                    onClick={() => parseJsonTokens(true)} 
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
                              <button type="button" onClick={() => addToken(true)} className="add-token-btn">
                                Add Token
                              </button>
                            </div>

                            {/* Token List */}
                            <div className="token-list">
                              {editBlog.tokens.map((token, index) => (
                                <div key={index} className="token-item">
                                  {editingToken === index ? (
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
                                          onClick={() => saveTokenEdit(index, true)}
                                          className="save-edit-btn"
                                        >
                                          ✓
                                        </button>
                                        <button 
                                          type="button" 
                                          onClick={cancelTokenEdit}
                                          className="cancel-edit-btn"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="token-text">{token.text}</span>
                                      <span className="token-pinyin">({token.pinyin})</span>
                                      <span className="token-meaning">→ {token.meaning}</span>
                                      <div className="token-actions">
                                        <button 
                                          type="button" 
                                          onClick={() => startEditingToken(index, true)}
                                          className="edit-token-btn"
                                          title="Edit token"
                                        >
                                          ✏️
                                        </button>
                                        <button 
                                          type="button" 
                                          onClick={() => removeToken(index, true)}
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
                            <button onClick={handleEditBlogSubmit} className="save-btn">
                              💾 Save
                            </button>
                            <button onClick={handleCancelEdit} className="cancel-btn">
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
                            <p className="blog-text">{blog.text}</p>
                            
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
                              onClick={() => handleEditBlog(blog)}
                              className="edit-btn"
                              title="Edit blog"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => deleteBlog(blog.id)}
                              className="delete-btn"
                              title="Delete blog"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'codes' && (
            <div className="codes-section">
              <div className="section-header">
                <h2>Activation Code Management</h2>
                <button onClick={generateActivationCode} className="generate-button">
                  Generate New Code
                </button>
              </div>
              
              <div className="codes-list">
                {activationCodes.length === 0 ? (
                  <p>No activation codes available</p>
                ) : (
                  activationCodes.map((code, index) => (
                    <div key={index} className="code-item">
                      <span className="code-text">{code}</span>
                      <button 
                        onClick={() => deleteActivationCode(code)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
