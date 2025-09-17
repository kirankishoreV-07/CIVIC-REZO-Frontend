import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Simple API URL generation without external dependencies
const generateApiBaseUrl = () => {
  // Use environment variables set by setup-network.js
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  const host = process.env.EXPO_PUBLIC_API_HOST || '10.12.73.132';
  const port = process.env.EXPO_PUBLIC_API_PORT || '3001';
  return `https://civic-rezo-backend-1.onrender.com`;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://edragfuoklcgdgtospuq.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkcmFnZnVva2xjZ2RndG9zcHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDE3MjMsImV4cCI6MjA3MjExNzcyM30.A58Ms03zTZC6J5OuhQbkkZQy-5uTxgu4vlLilrjPEwo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Dynamic API URL configuration for any device/network
const getApiBaseUrl = () => {
  return generateApiBaseUrl();
};

// API configuration - Works on any device
export const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API_BASE_URL configured as:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🔧 Development mode:', __DEV__);

export const apiClient = {
  // Base URL for constructing custom endpoints
  baseUrl: API_BASE_URL,
  
  // Health check endpoint
  health: `${API_BASE_URL}/health`,
  
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    signup: `${API_BASE_URL}/api/auth/signup`,
    profile: `${API_BASE_URL}/api/auth/profile`,
  },
  // Complaint endpoints
  complaints: {
    all: `${API_BASE_URL}/api/complaints/all`,
    create: `${API_BASE_URL}/api/complaints/create`,
    submit: `${API_BASE_URL}/api/complaints/submit`,
    personalReports: `${API_BASE_URL}/api/complaints/personal-reports`,
  },
  // Admin endpoints
  admin: {
    dashboard: `${API_BASE_URL}/api/admin/dashboard`,
  },
  // Heatmap endpoints
  heatMap: {
    data: `${API_BASE_URL}/api/heat-map/data`,
    statistics: `${API_BASE_URL}/api/heat-map/statistics`,
  },
};

// Enhanced API call function with auto-discovery
export const makeApiCall = async (url, options = {}) => {
  try {
    console.log('📡 Making API call to:', url);
    
    const token = await AsyncStorage.getItem('authToken');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    console.log('📤 Request details:', {
      url,
      method: mergedOptions.method || 'GET',
      headers: mergedOptions.headers,
      body: mergedOptions.body ? 'DATA_PRESENT' : 'NO_BODY'
    });

    const response = await fetch(url, mergedOptions);
    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response data:', data);

    if (!response.ok) {
      console.error('❌ API Error:', data);
      throw new Error(data.message || `HTTP ${response.status}: API call failed`);
    }

    return data;
  } catch (error) {
    console.error('🚨 API call error details:', {
      message: error.message,
      url,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.message.includes('Network request failed')) {
      throw new Error('Cannot connect to server. Make sure the backend is running and accessible.');
    }
    
    throw error;
  }
};
