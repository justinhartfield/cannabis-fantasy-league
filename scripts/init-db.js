#!/usr/bin/env node

/**
 * Database Initialization Script for Railway
 * 
 * This script runs automatically on Railway deployment to:
 * 1. Check if database tables exist
 * 2. Create tables if they don't exist using Drizzle Kit
 */

import mysql from 'mysql2/promise';
import { execSync } from 'child_process';

async function initDatabase() {
  console.log('[DB Init] Starting database initialization...');
  
  if (!process.env.DATABASE_URL) {
    console.error('[DB Init] ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  let connection;
  
  try {
    // Parse DATABASE_URL
    const dbUrl = new URL(process.env.DATABASE_URL);
    
    // Create connection
    connection = await mysql.createConnection({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port) || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1), // Remove leading slash
    });

    console.log('[DB Init] Connected to database');

    // Check if tables exist
    const [tables] = await connection.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'"
    );

    if (tables[0].count === 0) {
      console.log('[DB Init] Tables do not exist. Creating schema using Drizzle Kit...');
      
      try {
        // Use drizzle-kit to push schema
        console.log('[DB Init] Running: drizzle-kit push');
        execSync('npx drizzle-kit push --force', { 
          stdio: 'inherit',
          env: { ...process.env }
        });
        
        console.log('[DB Init] Schema created successfully!');
      } catch (drizzleError) {
        console.error('[DB Init] Failed to push schema with Drizzle Kit');
        console.error('[DB Init] Error:', drizzleError.message);
        throw drizzleError;
      }
    } else {
      console.log('[DB Init] Tables already exist. Skipping schema creation.');
    }

    console.log('[DB Init] Database initialization complete!');
    
  } catch (error) {
    console.error('[DB Init] ERROR:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('[DB Init] Cannot connect to database. Please check DATABASE_URL and ensure MySQL service is running.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization
initDatabase().catch(error => {
  console.error('[DB Init] Fatal error:', error);
  process.exit(1);
});
