import { useState } from "react";
import "./LessonPage.css";

function LessonPage() {
  const [showKeywords, setShowKeywords] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showProperNouns, setShowProperNouns] = useState(false);

  return (
    <div className="lesson-page">
      {/* Header */}
      <header className="lesson-header">
        <button>{"< Back"}</button>
        <h2>Huge Pet Expo Hosted in Jilin</h2>
      </header>

      {/* Main Content */}
      <div className="lesson-content">
        <p>
        南华早报》在1903年4月1日，由原《孖剌西报》（Daily Press）编辑主任克宁汉（Alfred Cunningham）与谢缵泰等于都爹利街成立，6月1日迁往干诺道办公室。11月6日首份报纸出版，当时出纸一张，零售一角，日销六百份[3]:23。当时中文名称为《南清早报》，到1913年才改为《南华早报》。1906年，原美籍牙医、商人那布（J.W.Noble）入股《南华早报》。

《南早》的办报目的众说纷纭，外界一般认为创办人之一的谢缵泰欲透过办报以支援颠覆满清皇朝的革命事业，并以英语向世界宣扬中国的革命事业[4]。初期谢缵泰负责招揽生意，社论由英籍记者克宁汉、Douglas Story和Thomas Petrie等执笔，并与港英政府保持良好关系[5]。

《南早》成立初期，业务曾一度亏损，1907年更录得92,939元亏蚀，因此爆发了一场管理危机，最终谢和克宁汉离场。与此同时，曾成功营救牛奶公司避过破产危机的美国商人Dr. Joseph Whittlesey Noble购入其70%股权，经过6年努力，成功转亏为盈，并在1913年录得首次盈利11,338元。透过收购包括《士蔑报》（Hongkong Telegraph）等竞争对手，以及引入亚洲首台整排铸排机作植字印刷，《南早》在香港报业渐露头角，持续录得盈利，更在1937年加印周日版《Sunday Morning Post》[6]。
        </p>

        {/* Expandable sections */}
        <div className="accordion">
          <button onClick={() => setShowKeywords(!showKeywords)}>
            Keywords
          </button>
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
