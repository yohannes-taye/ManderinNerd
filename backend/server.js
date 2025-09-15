const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

app.get("/", (req, res) => res.send("API is running"));

app.get("/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
});

// Get all blogs
app.get("/blogs", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, text, tokens, created_at FROM blogs ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/blogs/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, text, tokens FROM blogs WHERE id = $1",
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/blogs", async (req, res) => {
  try {
    const { title, text, tokens } = req.body;
    
    if (!title || !text || !tokens) {
      return res.status(400).json({ error: "Title, text, and tokens are required" });
    }

    const { rows } = await pool.query(
      "INSERT INTO blogs (title, text, tokens) VALUES ($1, $2, $3) RETURNING id, title, text, tokens, created_at",
      [title, text, JSON.stringify(tokens)]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update a blog
app.put("/blogs/:id", async (req, res) => {
  try {
    const { title, text, tokens } = req.body;
    const blogId = req.params.id;
    
    if (!title || !text || !tokens) {
      return res.status(400).json({ error: "Title, text, and tokens are required" });
    }

    const { rows } = await pool.query(
      "UPDATE blogs SET title = $1, text = $2, tokens = $3 WHERE id = $4 RETURNING id, title, text, tokens, created_at",
      [title, text, JSON.stringify(tokens), blogId]
    );
    
    if (!rows.length) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a blog
app.delete("/blogs/:id", async (req, res) => {
  try {
    const blogId = req.params.id;
    
    const { rows } = await pool.query(
      "DELETE FROM blogs WHERE id = $1 RETURNING id",
      [blogId]
    );
    
    if (!rows.length) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`));
