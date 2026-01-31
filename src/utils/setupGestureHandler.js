// Setup react-native-gesture-handler for both web and native environments
// This ensures that the import works properly in both environments

// Only import react-native-gesture-handler in native environments
if (typeof window === 'undefined' || !window.document) {
  // Native environment - import the gesture handler
  try {
    require('react-native-gesture-handler');
  } catch (error) {
    console.warn('react-native-gesture-handler could not be imported:', error.message);
  }
} else {
  // Web environment - gesture handler is not needed
  // react-native-gesture-handler is primarily for native touch interactions
  console.log('Skipping react-native-gesture-handler for web environment');
}