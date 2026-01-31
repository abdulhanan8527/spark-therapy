// Metro configuration to exclude problematic native modules for web builds
const {getDefaultConfig, mergeConfig} = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Fix for white screen issues - ensure proper asset resolution
config.resolver.assetExts.push('db', 'sqlite');

// Add resolver asset plugin to properly handle assets
config.resolver.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Enable inline requires for better performance
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Fix for web platform rendering
config.server.enhanceMiddleware = (middleware, server) => {
  return (req, res, next) => {
    // Ensure proper MIME types for web assets
    if (req.url.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (req.url.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    return middleware(req, res, next);
  };
};

// Exclude problematic native modules for web compatibility
config.resolver.blockList = [
  // Block react-native-pdf fabric modules that don't support web
  /node_modules[\/\\]react-native-pdf[\/\\]fabric[\/\\].*\.js$/,
  // Block the specific problematic file mentioned in the error
  /node_modules[\/\\]react-native-pdf[\/\\]fabric[\/\\]RNPDFPdfNativeComponent\.js$/,
  // Block react-native-screens fabric modules
  /node_modules[\/\\]react-native-screens[\/\\]fabric[\/\\].*\.js$/,
  // Block react-native-screens native modules for web
  /node_modules[\/\\]react-native-screens[\/\\].*NativeScreensModule\.js$/,
  // Block react-native-screens native modules specifically
  /node_modules[\/\\]react-native-screens[\/\\]lib[\/\\]module[\/\\]fabric[\/\\].*\.js$/,
  // More general pattern to catch any fabric imports in react-native-screens
  /node_modules[\/\\]react-native-screens[\/\\].*[\/\\]fabric[\/\\].*\.js$/,
  // Block other native-only codegen modules
  /node_modules[\/\\]react-native[\/\\]Libraries[\/\\]Utilities[\/\\]codegenNativeComponent.*\.js$/,
  // Also exclude other common web-incompatible native modules
  /node_modules[\/\\].*[\/\\]fabric[\/\\].*\.js$/,
  /node_modules[\/\\]react-native-reanimated[\/\\].*\.web\.(js|ts|jsx|tsx)$/,
];

// Add resolver source extensions - prioritize specific platform extensions
config.resolver.sourceExts = [
  'android.js', 'android.jsx', 'android.ts', 'android.tsx', // Android-specific extensions
  'ios.js', 'ios.jsx', 'ios.ts', 'ios.tsx',               // iOS-specific extensions
  'web.js', 'web.jsx', 'web.ts', 'web.tsx',               // Web-specific extensions
  'native.js', 'native.jsx', 'native.ts', 'native.tsx',   // Native-specific extensions
  'js', 'jsx', 'ts', 'tsx'                                // Generic extensions last
];

// Use extraNodeModules to provide fallbacks for web environment
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native': path.resolve(__dirname, 'node_modules/react-native'),
  'react-native-gesture-handler': path.resolve(__dirname, 'node_modules/react-native-gesture-handler'),
  'react-native-screens': path.resolve(__dirname, 'node_modules/react-native-screens'),
  'expo-constants': path.resolve(__dirname, 'node_modules/expo-constants'),
  'expo-file-system': path.resolve(__dirname, 'node_modules/expo-file-system'),
  'expo-asset': path.resolve(__dirname, 'node_modules/expo-asset'),
  '@react-native': path.resolve(__dirname, 'node_modules/@react-native'),
  '@react-navigation': path.resolve(__dirname, 'node_modules/@react-navigation'),
  'styleq': path.resolve(__dirname, 'node_modules/styleq'),
  // Add aliases for specific react-native libraries that might be missing
  // Use relative path resolution from react-native package perspective
  './Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, 'node_modules/react-native/Libraries/Utilities/codegenNativeComponent.js'),
  'Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, 'node_modules/react-native/Libraries/Utilities/codegenNativeComponent.js'),
};

// Add platform-specific resolver for gesture handler, safe area context, and other problematic modules
config.resolver.resolveRequest = (context, realModuleName, platform, moduleName) => {
  // Handle @react-navigation scoped packages
  if (moduleName && moduleName.startsWith('@react-navigation/')) {
    const packageName = moduleName.split('/')[1];
    const possiblePath = path.resolve(__dirname, 'node_modules/@react-navigation', packageName, 'lib/commonjs/index.js');
    if (fs.existsSync(possiblePath)) {
      return {
        filePath: possiblePath,
        type: 'sourceFile',
      };
    }
  }
  
  // Handle styleq and its subpaths for all platforms
  if (moduleName && (moduleName === 'styleq' || moduleName.startsWith('styleq/'))) {
    const styleqBasePath = path.resolve(__dirname, 'node_modules/styleq');
    if (moduleName === 'styleq') {
      return {
        filePath: path.resolve(styleqBasePath, 'styleq.js'),
        type: 'sourceFile',
      };
    } else {
      // Handle subpaths like 'styleq/transform-localize-style'
      const subPath = moduleName.replace('styleq/', '');
      return {
        filePath: path.resolve(styleqBasePath, `${subPath}.js`),
        type: 'sourceFile',
      };
    }
  }
  
  // Handle react-native-gesture-handler for web
  if (platform === 'web' && moduleName === 'react-native-gesture-handler') {
    return {
      filePath: path.resolve(__dirname, 'src/utils/gestureHandler.web.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle react-native-safe-area-context for web
  if (platform === 'web' && moduleName === 'react-native-safe-area-context') {
    return {
      filePath: path.resolve(__dirname, 'src/utils/safeAreaContext.web.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle styleq for web (to avoid the react-native-web issue)
  if (platform === 'web' && moduleName && (moduleName.includes('styleq') || moduleName === 'styleq' || realModuleName === 'styleq')) {
    return {
      filePath: path.resolve(__dirname, 'src/utils/styleq.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle react-native-web StyleSheet for web
  if (platform === 'web' && moduleName && moduleName.includes('react-native-web/dist/exports/StyleSheet')) {
    // Return a simple mock that avoids the styleq dependency
    return {
      filePath: path.resolve(__dirname, 'src/utils/StyleSheet.web.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle direct styleq imports from react-native-web
  if (platform === 'web' && realModuleName && realModuleName.includes('react-native-web') && moduleName === 'styleq') {
    return {
      filePath: path.resolve(__dirname, 'src/utils/styleq.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle the specific case where react-native/index.js tries to require './Libraries/Utilities/codegenNativeComponent'
  if (realModuleName && realModuleName.includes('react-native') && moduleName === './Libraries/Utilities/codegenNativeComponent') {
    return {
      filePath: path.resolve(__dirname, 'src/utils/codegenNativeComponent.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle codegenNativeComponent for different platforms
  if (moduleName && moduleName.includes('codegenNativeComponent')) {
    if (platform === 'android' || platform === 'ios') {
      // For native platforms, return a mock implementation since the actual file may not exist
      return {
        filePath: path.resolve(__dirname, 'src/utils/codegenNativeComponent.js'),
        type: 'sourceFile',
      };
    } else {
      // For web, return a mock implementation
      return {
        filePath: path.resolve(__dirname, 'src/utils/codegenNativeComponent.js'),
        type: 'sourceFile',
      };
    }
  }
  
  // Handle other codegen-related modules that might cause issues
  if (moduleName && moduleName.includes('codegen')) {
    if (platform === 'android' || platform === 'ios') {
      // For native platforms, return a mock implementation
      return {
        filePath: path.resolve(__dirname, 'src/utils/codegenNativeComponent.js'),
        type: 'sourceFile',
      };
    } else {
      // For web, return a mock implementation
      return {
        filePath: path.resolve(__dirname, 'src/utils/codegenNativeComponent.js'),
        type: 'sourceFile',
      };
    }
  }
  
  // Use default resolver for other cases
  return context.resolveRequest(context, realModuleName, platform, moduleName);
};

module.exports = config;