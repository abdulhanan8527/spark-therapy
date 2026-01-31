# SPARK Therapy Database Migration Guide

## Overview
This guide explains how to run database migrations for the SPARK Therapy application to properly set up the MongoDB schema and collections.

## Database Collections
The SPARK Therapy application uses the following MongoDB collections:

1. **users** - User accounts (parents, therapists, admins)
2. **children** - Child information and profiles
3. **programs** - Therapy programs and ABLLS-R targets
4. **sessions** - Therapy session records
5. **invoices** - Financial invoices
6. **notifications** - System notifications
7. **complaints** - User complaints and feedback
8. **fees** - Fee records
9. **schedules** - Session scheduling
10. **leaverequests** - Therapist leave requests
11. **feedback** - Session feedback records

## Running Migrations

### Prerequisites
- MongoDB instance running and accessible
- Backend `.env` file properly configured with `MONGODB_URI`

### Setting up Local MongoDB (for development)

To run migrations locally, you need MongoDB installed and running:

1. Install MongoDB Community Edition from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - Windows: `net start MongoDB`
   - macOS/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`
3. Verify MongoDB is running by connecting with MongoDB Compass or `mongosh`

### Setup Migration
To create all collections with proper schemas and indexes:

```bash
cd backend
npm run migrate
```

### Run All Sequential Migrations
To run all individual migration files in sequence:

```bash
cd backend
npm run migrate:all
```

### Seeding Sample Data
To populate the database with sample data for development:

```bash
cd backend
npm run seed
```

## Migration Process

### Schema Setup
The migration process:
1. Connects to MongoDB using the `MONGODB_URI` from `.env`
2. Imports all model definitions from `./models/`
3. Creates collections based on model schemas
4. Sets up proper indexes for optimal performance
5. Closes the database connection

### Indexes Created
- Users: email (unique)
- Children: parentId, therapistId (references)
- Programs: childId (reference)
- Sessions: therapistId, childId, parentId (references)
- Invoices: parentId, childId, invoiceNumber (unique)
- Notifications: recipientId (index)
- Complaints: parentId, childId (references)
- Fees: parentId, childId, invoiceId (references)
- Schedules: therapistId, childId (references)
- LeaveRequests: therapistId (reference)
- Feedback: childId, therapistId, parentId (references)

## Environment Configuration

Ensure your `.env` file in the backend directory contains:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/spark_therapy
```

For local development:
```env
MONGODB_URI=mongodb://localhost:27017/spark_therapy
```

## Troubleshooting

### Connection Issues
- Verify MongoDB is running
- Check that `MONGODB_URI` is correctly set in `.env`
- Ensure network access to the MongoDB instance

### Permission Issues
- Verify database user has create/index permissions
- Check that the database name in the connection string is correct

### Index Creation Issues
- The migration script uses `syncIndexes()` which will update existing indexes
- If you encounter issues, try dropping and recreating indexes manually

## Production Considerations

- Always backup your database before running migrations in production
- Test migrations on a staging environment first
- Monitor the migration process for any errors
- Verify data integrity after migrations complete