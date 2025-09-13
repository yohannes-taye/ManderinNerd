exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO blogs (title, text, tokens) VALUES (
      '第二篇博客 - 中国茶文化',
      '中国的茶文化有几千年的历史，是中国人日常生活中不可或缺的一部分。无论是在家庭聚会、朋友聊天，还是在重要的商务谈判中，茶总是扮演着重要的角色。不同的茶叶，如绿茶、红茶、乌龙茶和普洱茶，各自有独特的味道和冲泡方法。喝茶不仅是一种解渴的方式，更是一种交流感情和传递礼仪的方式。',
      '[
        { "text": "中国", "pinyin": "zhōng guó", "meaning": "China" },
        { "text": "茶", "pinyin": "chá", "meaning": "tea" },
        { "text": "文化", "pinyin": "wén huà", "meaning": "culture" },
        { "text": "几千年", "pinyin": "jǐ qiān nián", "meaning": "thousands of years" },
        { "text": "历史", "pinyin": "lì shǐ", "meaning": "history" },
        { "text": "日常生活", "pinyin": "rì cháng shēng huó", "meaning": "daily life" },
        { "text": "不可或缺", "pinyin": "bù kě huò quē", "meaning": "indispensable" },
        { "text": "部分", "pinyin": "bù fèn", "meaning": "part" },
        { "text": "家庭", "pinyin": "jiā tíng", "meaning": "family" },
        { "text": "聚会", "pinyin": "jù huì", "meaning": "gathering" },
        { "text": "朋友", "pinyin": "péng yǒu", "meaning": "friends" },
        { "text": "聊天", "pinyin": "liáo tiān", "meaning": "chat" },
        { "text": "商务", "pinyin": "shāng wù", "meaning": "business" },
        { "text": "谈判", "pinyin": "tán pàn", "meaning": "negotiation" },
        { "text": "不同", "pinyin": "bù tóng", "meaning": "different" },
        { "text": "绿茶", "pinyin": "lǜ chá", "meaning": "green tea" },
        { "text": "红茶", "pinyin": "hóng chá", "meaning": "black tea" },
        { "text": "乌龙茶", "pinyin": "wū lóng chá", "meaning": "oolong tea" },
        { "text": "普洱茶", "pinyin": "pǔ ěr chá", "meaning": "Pu-erh tea" },
        { "text": "独特", "pinyin": "dú tè", "meaning": "unique" },
        { "text": "味道", "pinyin": "wèi dào", "meaning": "flavor" },
        { "text": "冲泡", "pinyin": "chōng pào", "meaning": "brew/steep" },
        { "text": "方法", "pinyin": "fāng fǎ", "meaning": "method" },
        { "text": "不仅", "pinyin": "bù jǐn", "meaning": "not only" },
        { "text": "解渴", "pinyin": "jiě kě", "meaning": "quench thirst" },
        { "text": "交流", "pinyin": "jiāo liú", "meaning": "communicate" },
        { "text": "感情", "pinyin": "gǎn qíng", "meaning": "emotion/relationship" },
        { "text": "传递", "pinyin": "chuán dì", "meaning": "convey/deliver" },
        { "text": "礼仪", "pinyin": "lǐ yí", "meaning": "etiquette" }
      ]'
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM blogs WHERE title = '第二篇博客 - 中国茶文化';`);
};
