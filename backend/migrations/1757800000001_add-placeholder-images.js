exports.up = (pgm) => {
  // Add placeholder images to existing blogs
  pgm.sql(`
    UPDATE blogs 
    SET image_url = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=400&fit=crop&crop=center', 
        image_alt = 'Chinese language learning'
    WHERE title = 'First blog';
  `);
  
  pgm.sql(`
    UPDATE blogs 
    SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&crop=center', 
        image_alt = 'Chinese tea culture and tradition'
    WHERE title = '第二篇博客 - 中国茶文化';
  `);
};

exports.down = (pgm) => {
  // Remove placeholder images
  pgm.sql(`
    UPDATE blogs 
    SET image_url = NULL, image_alt = NULL
    WHERE title IN ('First blog', '第二篇博客 - 中国茶文化');
  `);
};
