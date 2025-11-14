#!/usr/bin/env node
/**
 * Create Admin User Script
 * Creates an admin user for the system
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdminUser() {
  try {
    console.log('='.repeat(50));
    console.log('Create Admin User');
    console.log('='.repeat(50));
    console.log();

    // Get user input
    const email = await question('Email: ');
    const password = await question('Password: ');
    const confirmPassword = await question('Confirm Password: ');

    // Validate
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      process.exit(1);
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('⚠️  User already exists. Updating to admin...');
      existingUser.is_admin = true;
      existingUser.password = password; // Will be hashed by model hook
      await existingUser.save();
      console.log('✅ User updated to admin');
    } else {
      // Create new admin user
      const adminUser = await User.create({
        email,
        password,
        is_admin: true,
        is_active: true
      });
      console.log('✅ Admin user created successfully');
      console.log(`   User ID: ${adminUser.id}`);
      console.log(`   Email: ${adminUser.email}`);
    }

    console.log();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Run script
createAdminUser();

