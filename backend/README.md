# SPARK Therapy Services Backend API

## Overview
This is the backend API for SPARK Therapy Services, built with Node.js and Express. The API provides a comprehensive RESTful interface for managing Applied Behavior Analysis (ABA) therapy services for children with autism and related disorders.

## Features
- User authentication and authorization (Parents, Therapists, Administrators)
- Child management and tracking
- ABLLS-R program builder and tracking
- Session scheduling and attendance tracking
- Progress monitoring and reporting
- Notification system
- Financial management (invoices, payments)

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Joi
- **Testing**: Jest
- **Documentation**: Markdown

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Navigate to the backend directory:
```bash
cd backend
```

3. Install dependencies:
```bash
npm install
```

4. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spark_therapy
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

5. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Documentation
Detailed API documentation can be found in [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

## Project Structure
```
backend/
├── config/                 # Configuration files
├── controllers/            # Request handlers
├── middleware/             # Custom middleware
├── models/                 # Database models
├── routes/                 # API routes
├── services/               # Business logic
├── utils/                  # Utility functions
├── helpers/                # Helper functions
├── docs/                   # Documentation
├── tests/                  # Test files
├── .env                    # Environment variables
├── server.js               # Entry point
└── package.json            # Project dependencies
```

## Database Schema
The application uses MongoDB with the following main collections:
- **Users**: Parents, Therapists, and Administrators
- **Children**: Child profiles and therapy assignments
- **Programs**: ABLLS-R programs with targets
- **Sessions**: Therapy sessions and attendance
- **Notifications**: System notifications and messages
- **Invoices**: Financial records and payments

## Authentication
The API uses JWT-based authentication:
1. Users register or login to receive a token
2. Token is included in the Authorization header for protected routes
3. Tokens expire after 7 days by default

## Error Handling
All API responses follow a consistent format:
- Success responses: `{ success: true, message: "...", data: {...} }`
- Error responses: `{ success: false, message: "..." }`

## Scripts

- `npm start`: Start the server in production mode
- `npm run dev`: Start the server in development mode with nodemon
- `npm test`: Run tests
- `npm run migrate`: Set up database collections and indexes
- `npm run seed`: Populate database with sample data

## Testing
Run tests with:
```bash
npm test
```

## Development Guidelines
- Follow RESTful API design principles
- Use consistent error handling
- Validate all input data
- Document API endpoints
- Write unit tests for critical functionality

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License
This project is licensed under the MIT License.

## Support
For support, contact the development team or open an issue in the repository.