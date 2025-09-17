// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for image protocols
config.resolver.assetExts.push('jpg', 'jpeg', 'png', 'gif', 'webp');

// Allow HTTP sources
config.resolver.sourceExts = [...config.resolver.sourceExts, 'http', 'https'];

// Configure HTTP resources to be handled
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
