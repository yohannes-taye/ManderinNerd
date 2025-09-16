exports.up = (pgm) => {
  // Add is_admin field to users table
  pgm.addColumns("users", {
    is_admin: { type: "boolean", notNull: true, default: false },
    created_by: { type: "integer", references: "users(id)" }
  });
  
  // Create index on is_admin for faster filtering
  pgm.createIndex("users", "is_admin");
};

exports.down = (pgm) => {
  // Drop index first
  pgm.dropIndex("users", "is_admin");
  
  // Remove columns
  pgm.dropColumns("users", ["is_admin", "created_by"]);
};
