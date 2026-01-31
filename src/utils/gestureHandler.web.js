// Web stub for react-native-gesture-handler
// This file is used when bundling for web to avoid importing native gesture handler

// Export empty implementations
export const GestureHandlerRootView = ({ children }) => children;
export const GestureDetector = ({ children }) => children;
export const Gesture = {};
export const gestureHandlerRootHOC = (Component) => Component;
export const Directions = {};

// Default export
export default {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
  gestureHandlerRootHOC,
  Directions,
};
