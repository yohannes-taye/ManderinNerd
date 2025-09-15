import { useState } from "react";
import "./CreateBlogPage.css";

function CreateBlogPage({ onNavigateBack, onBlogCreated }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState([]);
  const [currentToken, setCurrentToken] = useState({ text: "", pinyin: "", meaning: "" });
  const [editingToken, setEditingToken] = useState(null);
  const [editToken, setEditToken] = useState({ text: "", pinyin: "", meaning: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addToken = () => {
    if (currentToken.text && currentToken.pinyin && currentToken.meaning) {
      setTokens([...tokens, { ...currentToken }]);
      setCurrentToken({ text: "", pinyin: "", meaning: "" });
    }
  };

  const removeToken = (index) => {
    setTokens(tokens.filter((_, i) => i !== index));
  };

  const startEditing = (index) => {
    setEditingToken(index);
    setEditToken({ ...tokens[index] });
  };

  const saveEdit = (index) => {
    if (editToken.text && editToken.pinyin && editToken.meaning) {
      const updatedTokens = [...tokens];
      updatedTokens[index] = { ...editToken };
      setTokens(updatedTokens);
      setEditingToken(null);
      setEditToken({ text: "", pinyin: "", meaning: "" });
    }
  };

  const cancelEdit = () => {
    setEditingToken(null);
    setEditToken({ text: "", pinyin: "", meaning: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const getApiUrl = () => {
        if (process.env.NODE_ENV === 'production') {
          return process.env.REACT_APP_API_URL || '/api';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      };

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          text,
          tokens
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newBlog = await response.json();
      console.log('Blog created successfully:', newBlog);
      
      // Reset form
      setTitle("");
      setText("");
      setTokens([]);
      setEditingToken(null);
      setEditToken({ text: "", pinyin: "", meaning: "" });
      
      // Notify parent component
      if (onBlogCreated) {
        onBlogCreated(newBlog);
      }
      
      // Navigate back
      if (onNavigateBack) {
        onNavigateBack();
      }
    } catch (err) {
      console.error('Error creating blog:', err);
      setError('Failed to create blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-blog-page">
      {/* Header */}
      <header className="create-blog-header">
        <button onClick={onNavigateBack}>{"< Back"}</button>
        <h2>Create New Blog</h2>
      </header>

      {/* Main Content */}
      <div className="create-blog-content">
        <form onSubmit={handleSubmit} className="blog-form">
          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title..."
              required
            />
          </div>

          {/* Text Input */}
          <div className="form-group">
            <label htmlFor="text">Chinese Text:</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter Chinese text..."
              rows="6"
              required
            />
          </div>

          {/* Token Management */}
          <div className="form-group">
            <label>Vocabulary Tokens:</label>
            
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
              {tokens.map((token, index) => (
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

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting || !title || !text || tokens.length === 0}
          >
            {isSubmitting ? "Creating..." : "Create Blog"}
          </button>
        </form>
      </div>

      {/* Bottom Navigation */}
      <footer className="create-blog-footer">
        <button onClick={onNavigateBack}>📖 Back to Lesson</button>
        <button type="button" onClick={() => {
          setTitle("");
          setText("");
          setTokens([]);
          setEditingToken(null);
          setEditToken({ text: "", pinyin: "", meaning: "" });
          setError("");
        }}>
          🔄 Reset Form
        </button>
      </footer>
    </div>
  );
}

export default CreateBlogPage;
