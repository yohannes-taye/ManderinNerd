exports.up = (pgm) => {
  // Add image field to blogs table
  pgm.addColumns("blogs", {
    image_url: { type: "varchar(500)", notNull: false },
    image_alt: { type: "varchar(255)", notNull: false }
  });
};

exports.down = (pgm) => {
  // Remove image fields
  pgm.dropColumns("blogs", ["image_url", "image_alt"]);
};
