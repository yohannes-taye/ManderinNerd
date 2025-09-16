exports.up = (pgm) => {
  // Add authentication and activation fields to users table
  pgm.addColumns("users", {
    activation_code: { type: "varchar(50)", unique: true },
    is_activated: { type: "boolean", notNull: true, default: false },
    activation_code_used_at: { type: "timestamp" },
    last_login: { type: "timestamp" },
    login_attempts: { type: "integer", notNull: true, default: 0 },
    locked_until: { type: "timestamp" },
  });

  // Create index on activation_code for faster lookups
  pgm.createIndex("users", "activation_code", { unique: true });
  
  // Create index on is_activated for faster filtering
  pgm.createIndex("users", "is_activated");
};

exports.down = (pgm) => {
  // Drop indexes first
  pgm.dropIndex("users", "is_activated");
  pgm.dropIndex("users", "activation_code");
  
  // Remove columns
  pgm.dropColumns("users", [
    "activation_code",
    "is_activated", 
    "activation_code_used_at",
    "last_login",
    "login_attempts",
    "locked_until"
  ]);
};
