exports.up = (pgm) => {
  pgm.createTable("blogs", {
    id: "id",
    title: { type: "varchar(255)", notNull: true },
    text: { type: "text", notNull: true },
    tokens: { type: "jsonb", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("blogs");
};