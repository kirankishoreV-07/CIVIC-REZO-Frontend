import { Platform } from 'react-native';

/**
 * Get the API host from environment or fallback
 */
const getApiHost = () => {
  // Always prioritize environment variables
  if (process.env.EXPO_PUBLIC_API_HOST) {
    return process.env.EXPO_PUBLIC_API_HOST;
  }

  // Platform-specific defaults
  if (!__DEV__) {
    return 'your-production-api.com';
  }

  if (Platform.OS === 'web') {
    return 'localhost';
  }

  // Mobile fallback - this should be set by setup-network.js
  return '10.12.73.132';
};

/**
 * Get the API port from environment or fallback
 */
const getApiPort = () => {
  const port = process.env.EXPO_PUBLIC_API_PORT || '3001';
  return String(port); // Ensure it's always a string
};

/**
 * Generate API base URL - simplified version to avoid module issues
 */
export const generateApiBaseUrl = () => {
  // First try to use the complete URL from environment
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('📡 Using complete API URL from environment:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Build URL from components
  const host = getApiHost();
  const port = getApiPort();
  const url = `https://civic-rezo-backend-1.onrender.com`;
  
  console.log('📡 Generated API URL:', url);
  console.log('🔧 Host:', host);
  console.log('🔧 Port:', port);
  
  return url;
};

/**
 * Get the current network host
 */
export const getNetworkHost = () => {
  return getApiHost();
};
