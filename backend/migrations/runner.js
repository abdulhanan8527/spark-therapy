/**
 * Migration Runner
 * Handles running multiple sequential migrations for the SPARK Therapy application
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' }); // Load local environment if available

class MigrationRunner {
  constructor() {
    this.migrationsDir = path.join(__dirname);
    this.appliedMigrations = new Set();
  }

  async connectToDatabase() {
    console.log('Connecting to MongoDB...');
    const dbUri = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/spark_therapy';
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB successfully!');
  }

  async disconnectFromDatabase() {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }

  getMigrationFiles() {
    const files = fs.readdirSync(this.migrationsDir);
    return files
      .filter(file => file.endsWith('.js') && file !== 'runner.js')
      .sort(); // Sort to ensure migrations run in order
  }

  async loadMigration(filePath) {
    const fullPath = path.join(this.migrationsDir, filePath);
    try {
      const migration = require(fullPath);
      return {
        name: filePath,
        ...migration
      };
    } catch (error) {
      console.error(`Failed to load migration ${filePath}:`, error);
      throw error;
    }
  }

  async runMigrations() {
    console.log('Starting migration process...');
    
    try {
      await this.connectToDatabase();
      
      const migrationFiles = this.getMigrationFiles();
      console.log(`Found ${migrationFiles.length} migration files`);
      
      for (const file of migrationFiles) {
        console.log(`\nRunning migration: ${file}`);
        
        const migration = await this.loadMigration(file);
        
        try {
          await migration.up();
          console.log(`✓ Migration ${file} completed successfully`);
        } catch (error) {
          console.error(`✗ Migration ${file} failed:`, error.message);
          throw error;
        }
      }
      
      console.log('\nAll migrations completed successfully!');
    } catch (error) {
      console.error('Migration process failed:', error);
      throw error;
    } finally {
      await this.disconnectFromDatabase();
    }
  }

  async rollbackMigration(migrationName) {
    console.log(`Rolling back migration: ${migrationName}`);
    
    try {
      await this.connectToDatabase();
      
      const migration = await this.loadMigration(migrationName);
      
      if (migration.down) {
        await migration.down();
        console.log(`✓ Migration ${migrationName} rolled back successfully`);
      } else {
        console.log(`⚠ Migration ${migrationName} does not support rollback`);
      }
    } catch (error) {
      console.error(`Rollback failed for ${migrationName}:`, error);
      throw error;
    } finally {
      await this.disconnectFromDatabase();
    }
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const runner = new MigrationRunner();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'rollback' && args[1]) {
    runner.rollbackMigration(args[1])
      .catch(err => {
        console.error('Migration rollback failed:', err);
        process.exit(1);
      });
  } else {
    runner.runMigrations()
      .catch(err => {
        console.error('Migration failed:', err);
        process.exit(1);
      });
  }
}

module.exports = MigrationRunner;