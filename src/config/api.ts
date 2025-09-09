// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },
    USERS: {
      PROFILE: '/users/profile',
      LIST: '/users',
    },
    DASHBOARD: {
      STATS: '/dashboard/stats',
    },
    VENDOR_MASTER: {
      LIST: '/api/vendor-master',
      CREATE: '/api/vendor-master',
      UPDATE: '/api/vendor-master',
      DELETE: '/api/vendor-master',
      GET_BY_ID: '/api/vendor-master',
    },
    CATEGORY_MASTER: {
      LIST: '/api/category-master',
      CREATE: '/api/category-master',
      UPDATE: '/api/category-master',
      DELETE: '/api/category-master',
      GET_BY_ID: '/api/category-master',
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};  

// Token storage keys
export const TOKEN_STORAGE = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};