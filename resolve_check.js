const path = require('path');
try {
    console.log('Resolving react-native-gesture-handler...');
    const resolved = require.resolve('react-native-gesture-handler');
    console.log('Resolved to:', resolved);
} catch (e) {
    console.error('Failed to resolve:', e.message);
}
