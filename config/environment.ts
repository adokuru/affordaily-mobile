import { Platform } from "react-native";

const getDefaultApiUrl = () => {
  if (!__DEV__) {
    return "https://api.affordaily.com/api/v1";
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api/v1";
  }

  return "http://localhost:8000/api/v1";
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();

// Export configuration
export const config = {
  apiUrl: API_URL,
  apiTimeout: 30000, // 30 seconds
  enableDebugLogs: __DEV__, // Enable logs in development only
};

// Helper to determine if we're running in development
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;
