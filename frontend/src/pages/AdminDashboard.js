import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={onNavigateBack} className="back-button">
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
              <h2>Blog Management</h2>
              <div className="blogs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="3">Loading...</td></tr>
                    ) : (
                      blogs.map(blog => (
                        <tr key={blog.id}>
                          <td>{blog.title}</td>
                          <td>{formatDate(blog.created_at)}</td>
                          <td>
                            <button 
                              onClick={() => deleteBlog(blog.id)}
                              className="delete-button"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
