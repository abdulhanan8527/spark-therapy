module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-optional-chaining',
      'react-native-reanimated/plugin', // This must be the last plugin
    ],
  };
};