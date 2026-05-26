/**
 * Environment Configuration
 *
 * This file contains environment-specific configuration for the app.
 * Update the API_URL based on your development setup.
 */

// Uncomment the appropriate BASE_URL for your environment:

// 1. For Android Emulator (localhost on emulator maps to 10.0.2.2)
// const API_URL = 'http://10.0.2.2:8000/api/v1';

// 2. For iOS Simulator (can use localhost)
// const API_URL = 'http://localhost:8000/api/v1';

// 3. For Physical Device (use your computer's local IP)
// Find your IP: Windows (ipconfig), Mac/Linux (ifconfig or ip addr)
// const API_URL = 'http://192.168.1.100:8000/api/v1';

// 4. For Production
// const API_URL = 'https://api.affordaily.com/api/v1';

// 5. For local .test domain (requires proper network configuration)
const API_URL = "https://api.affordaily.com/api/v1";

// Export configuration
export const config = {
  apiUrl: API_URL,
  apiTimeout: 30000, // 30 seconds
  enableDebugLogs: __DEV__, // Enable logs in development only
};

// Helper to determine if we're running in development
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;
