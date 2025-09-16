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
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [constructSentence, setConstructSentence] = useState(true);

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
      setTokens([...tokens, ...validTokens]);
      
      // Construct sentence from imported tokens and populate text field (if enabled)
      if (constructSentence) {
        const constructedSentence = validTokens.map(token => token.text).join('');
        if (constructedSentence) {
          setText(prevText => prevText ? `${prevText}${constructedSentence}` : constructedSentence);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const getApiUrl = () => {
        if (process.env.NODE_ENV === 'production') {
          return process.env.REACT_APP_API_URL || 'http://68.183.250.107:5000';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5000';
      };

      const apiUrl = getApiUrl();
      const fetchUrl = `${apiUrl}/blogs`;
      console.log('CreateBlog - Final API URL used:', fetchUrl);
      console.log('CreateBlog - Environment:', process.env.NODE_ENV);
      console.log('CreateBlog - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
      
      const response = await fetch(fetchUrl, {
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
      setJsonInput("");
      setJsonError("");
      setConstructSentence(true);
      
      // Notify parent component
      if (onBlogCreated) {
        onBlogCreated(newBlog);
      }
      
      // Navigate back
      window.location.href = '/';
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
        <button onClick={() => window.location.href = '/'}>{"< Back"}</button>
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
            <div className="token-header">
              <label>Vocabulary Tokens:</label>
              <span className="token-counter">
                📊 {tokens.length} token{tokens.length !== 1 ? 's' : ''}
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
        <button onClick={() => window.location.href = '/'}>📖 Back to Lesson</button>
        <button type="button" onClick={() => {
          setTitle("");
          setText("");
          setTokens([]);
          setEditingToken(null);
          setEditToken({ text: "", pinyin: "", meaning: "" });
          setJsonInput("");
          setJsonError("");
          setConstructSentence(true);
          setError("");
        }}>
          🔄 Reset Form
        </button>
      </footer>
    </div>
  );
}

export default CreateBlogPage;
