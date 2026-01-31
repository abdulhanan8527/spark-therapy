// StorageUtils.js - Universal storage utility for both web and native
let storage;

// Determine if we're in a web environment more robustly
const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

if (isWeb) {
  // Web environment - use localStorage
  storage = {
    getItem: (key) => {
      try {
        return Promise.resolve(window.localStorage.getItem(key));
      } catch (error) {
        console.error('Error getting item from localStorage:', error);
        return Promise.resolve(null);
      }
    },
    setItem: (key, value) => {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting item to localStorage:', error);
      }
      return Promise.resolve();
    },
    removeItem: (key) => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing item from localStorage:', error);
      }
      return Promise.resolve();
    },
    clear: () => {
      try {
        window.localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      return Promise.resolve();
    }
  };
} else {
  // Native environment - use AsyncStorage
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    storage = {
      getItem: (key) => AsyncStorage.getItem(key),
      setItem: (key, value) => AsyncStorage.setItem(key, value),
      removeItem: (key) => AsyncStorage.removeItem(key),
      clear: () => AsyncStorage.clear(),
    };
  } catch (error) {
    console.error('AsyncStorage not available, falling back to in-memory storage:', error);
    
    // Fallback in-memory storage
    const inMemoryStorage = {};
    storage = {
      getItem: (key) => Promise.resolve(inMemoryStorage[key] || null),
      setItem: (key, value) => {
        inMemoryStorage[key] = value;
        return Promise.resolve();
      },
      removeItem: (key) => {
        delete inMemoryStorage[key];
        return Promise.resolve();
      },
      clear: () => {
        for (let key in inMemoryStorage) {
          delete inMemoryStorage[key];
        }
        return Promise.resolve();
      }
    };
  }
}

export default storage;