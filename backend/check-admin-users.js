const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking for admin users...\n');
    
    // Check if is_admin column exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_admin'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ is_admin column does not exist in users table');
      console.log('💡 You need to run the migration first: npm run migrate:up');
      return;
    }
    
    console.log('✅ is_admin column exists\n');
    
    // Get all users
    const allUsers = await pool.query(`
      SELECT id, email, is_activated, is_admin, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Total users: ${allUsers.rows.length}\n`);
    
    if (allUsers.rows.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    // Display all users
    console.log('👥 All users:');
    console.log('ID | Email | Activated | Admin | Created');
    console.log('---|-------|-----------|-------|--------');
    allUsers.rows.forEach(user => {
      console.log(`${user.id} | ${user.email} | ${user.is_activated ? '✅' : '❌'} | ${user.is_admin ? '👑' : '👤'} | ${user.created_at.toISOString().split('T')[0]}`);
    });
    
    // Check for admin users
    const adminUsers = allUsers.rows.filter(user => user.is_admin);
    
    console.log(`\n👑 Admin users: ${adminUsers.length}`);
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found');
      console.log('💡 To create an admin user, you can:');
      console.log('   1. Update an existing user: UPDATE users SET is_admin = true WHERE email = "your-email@example.com";');
      console.log('   2. Or use the admin API to create a new admin user');
    } else {
      console.log('✅ Admin users found:');
      adminUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdminUsers();
