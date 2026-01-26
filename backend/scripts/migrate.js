#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Database migration script for Marketplace Mandi
 * This script can be run to set up the database schema when a PostgreSQL instance is available
 */

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('Please set DATABASE_URL in your .env file');
      process.exit(1);
    }
    
    console.log('📋 Checking Prisma schema...');
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run Prisma migration
    console.log('📦 Running Prisma migration...');
    try {
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Prisma migrate failed, trying to push schema directly...');
      execSync('npx prisma db push', { stdio: 'inherit' });
    }
    
    // Seed the database with initial data
    console.log('🌱 Seeding database with initial data...');
    try {
      execSync('npx prisma db seed', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  No seed script found, skipping seeding');
    }
    
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📝 Manual migration instructions:');
    console.log('1. Ensure PostgreSQL is running');
    console.log('2. Create database: CREATE DATABASE marketplace_mandi;');
    console.log('3. Run the SQL script: backend/scripts/create-migration.sql');
    console.log('4. Generate Prisma client: npx prisma generate');
    process.exit(1);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };