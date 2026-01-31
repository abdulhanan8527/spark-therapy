# SPARKTherapy - Multi-Platform Application

This is a multi-platform application built with React Native and Expo that runs on Web, Android, and iOS.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for backend)
- For Android development: Android Studio and Android SDK
- For iOS development: Xcode (macOS only)

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

or

```bash
yarn install
```

4. Navigate to the backend directory and install backend dependencies:

```bash
cd backend
npm install
```

## Running the Application

### Backend Server
First, start the backend server:

```bash
cd backend
node start-server.js
```

The backend will run on `http://localhost:5001`.

### Frontend Applications

#### Web
To run the application on web:

```bash
npm run web
```

or use the provided script:

```bash
./start-web.sh
```

#### Android
To run the application on Android:

```bash
npm run android
```

or use the provided script:

```bash
./start-android.sh
```

#### iOS
To run the application on iOS:

```bash
npm run ios
```

or use the provided script:

```bash
./start-ios.sh
```

### Quick Start (Both Backend and Frontend)
Use the provided script to start both servers:

```bash
./start-full-app.sh
```

## Environment Variables

The application uses a `.env` file for configuration. Make sure you have the following variable set:

```
REACT_APP_API_BASE_URL=http://127.0.0.1:5001/api
```

**Note**: Make sure the backend server is running on port 5001 before starting the frontend.

## Project Structure

The project is organized as follows:

- `src/` - Contains the main source code
- `src/components/` - Reusable UI components
- `src/screens/` - Screen components for different views
- `src/navigation/` - Navigation configuration
- `src/contexts/` - React Context providers
- `src/services/` - API service implementations
- `backend/` - Backend server code

## Dependencies

The project uses Expo to provide cross-platform compatibility. Key dependencies include:

- React Native
- Expo
- React Navigation
- React Native Gesture Handler
- React Native Screens
- React Native Safe Area Context
- Axios for API requests

## Troubleshooting

If you encounter issues:

1. Make sure both backend and frontend dependencies are installed
2. Ensure MongoDB is running before starting the backend
3. Check that your `.env` file is properly configured
4. Ensure the backend server is running before starting the frontend
5. Clear the cache: `npx expo start --clear`

## Development

This project was converted from a pure React Native project to an Expo-managed project to enable web support while maintaining compatibility with Android and iOS.