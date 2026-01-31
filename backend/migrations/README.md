# SPARK Therapy Database Migrations

This directory contains database migration scripts for the SPARK Therapy application.

## Overview

The SPARK Therapy application uses MongoDB as its database with Mongoose ODM. Rather than traditional sequential migration files, this application uses a schema synchronization approach that ensures all collections have the proper structure based on the Mongoose models defined in the `./models/` directory.

## Migration Scripts

### 1. Schema Setup (`../migrate.js`)
- Creates all required collections based on Mongoose models
- Sets up proper indexes for optimal performance
- Ensures schema consistency across all collections

### 2. Sequential Migration Runner (`runner.js`)
- Runs individual migration files in sequence
- Handles complex migration scenarios
- Supports migration rollback
- Migration files should be named with numeric prefixes (e.g., `001-add-field.js`)

### 3. Data Seeding (`../seed-data.js`)
- Populates the database with initial sample data
- Creates default users (admin, therapist, parent)
- Adds sample children, programs, sessions, and other records
- Useful for development and testing environments

## Running Migrations

### Setup Collections and Indexes
```bash
cd backend
npm run migrate
```

### Seed with Sample Data
```bash
cd backend
npm run seed
```

## Collections Created

The migration process creates the following collections with their respective schemas:

- **users**: User accounts with authentication data
- **children**: Child profiles and information
- **programs**: Therapy programs with ABLLS-R targets
- **sessions**: Therapy session records
- **invoices**: Financial invoice data
- **notifications**: System notifications
- **complaints**: User complaints and feedback
- **fees**: Fee records
- **schedules**: Session scheduling
- **leaverequests**: Therapist leave requests
- **feedback**: Session feedback records

## Environment Configuration

The migration scripts will use the following environment variables in order of priority:
1. `MONGODB_URI` - Production/remote database
2. `MONGODB_LOCAL_URI` - Local development database
3. Default: `mongodb://127.0.0.1:27017/spark_therapy`

## Migration Process

The migration process:
1. Connects to MongoDB using configured connection string
2. Imports all model definitions from `./models/`
3. Creates collections based on model schemas
4. Sets up proper indexes using `syncIndexes()`
5. Closes the database connection

This approach ensures that the database structure always matches the application models, maintaining consistency across environments.