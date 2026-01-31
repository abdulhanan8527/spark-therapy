/**
 * Mock implementation of codegenNativeComponent for web compatibility
 */
export default function codegenNativeComponent(viewName, propTypes) {
  // Return a simple component for web that mimics native behavior
  return function(props) {
    return null;
  };
}