import { useState, useEffect } from "react";
import "./LessonPage.css";

function LessonPage() {
  const [showKeywords, setShowKeywords] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showProperNouns, setShowProperNouns] = useState(false);

  const [blog, setBlog] = useState(null);
  const [hoverWord, setHoverWord] = useState(null);

  useEffect(() => {
    // Fetch blog with ID = 1 (the one you seeded)
    fetch("http://localhost:5000/blogs/2")
      .then((res) => res.json())
      .then((data) => setBlog(data));
  }, []); 

  return (
    <div className="lesson-page">
      {/* Header */}
      <header className="lesson-header">
        <button>{"< Back"}</button>
        <h2>{blog ? blog.title : "Loading..."}</h2>
      </header>

      {/* Main Content */}
      <div className="lesson-content">
        {blog ? (
          <p>
            {blog.tokens.map((word, i) => (
              <span
                key={i}
                className="word"
                onMouseEnter={() => setHoverWord(i)}
                onMouseLeave={() => setHoverWord(null)}
              >
                {word.text}
              </span>
            ))}
          </p>
        ) : (
          <p>Loading blog...</p>
        )}

        {/* Tooltip-like info when hovering */}
        {hoverWord !== null && (
          <div className="tooltip">
            {blog.tokens[hoverWord].text} ({blog.tokens[hoverWord].pinyin}) →{" "}
            {blog.tokens[hoverWord].meaning}
          </div>
        )}

        {/* Expandable sections */}
        <div className="accordion">
          <button onClick={() => setShowKeywords(!showKeywords)}>Keywords</button>
          {showKeywords && <div className="panel">Some keywords here...</div>}

          <button onClick={() => setShowGrammar(!showGrammar)}>Grammar</button>
          {showGrammar && <div className="panel">Grammar explanation...</div>}

          <button onClick={() => setShowProperNouns(!showProperNouns)}>
            Proper Nouns
          </button>
          {showProperNouns && <div className="panel">Names & places...</div>}
        </div>
      </div>

      {/* Exercises */}
      <section className="exercises">
        <div className="exercise-card">
          <h3>Listening Exercises</h3>
          <ul>
            <li>True / False</li>
            <li>Most Suitable</li>
            <li>Fill in Blanks</li>
          </ul>
          <button>Begin ▶</button>
        </div>

        <div className="exercise-card">
          <h3>Reading Exercises</h3>
          <ul>
            <li>Keyword</li>
            <li>Complete the sentence</li>
            <li>Coupling</li>
          </ul>
          <button>Begin ▶</button>
        </div>
      </section>

      {/* Bottom Navigation */}
      <footer className="lesson-footer">
        <button>📖 Mark</button>
        <button>🔖 Save</button>
        <button>🎓 Exercises</button>
        <button>🈶 Pinyin</button>
        <button>⚙️ Settings</button>
      </footer>
    </div>
  );
}

export default LessonPage;
