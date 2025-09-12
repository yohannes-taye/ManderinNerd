exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO blogs (title, text, tokens) VALUES (
      'First blog',
      '我喜欢学习中文',
      '[
        { "text": "我", "pinyin": "wǒ", "meaning": "I/me" },
        { "text": "喜欢", "pinyin": "xǐ huān", "meaning": "like" },
        { "text": "学习", "pinyin": "xué xí", "meaning": "study/learn" },
        { "text": "中文", "pinyin": "zhōng wén", "meaning": "Chinese language" }
      ]'
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM blogs WHERE title = 'First blog';`);
};