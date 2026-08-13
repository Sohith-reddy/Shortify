export const ENDPOINTS = {
  SHORT_URL: {
    CREATE: '/api/shortUrl/shorten',
    ANALYTICS: '/api/shortUrl/analytics/:shortCode',
  },
  DASHBOARD: {
    GET_URLS: '/api/shortUrl/all?userId=:userId',
    GET_ALL: '/api/shortUrl/all',
  },
};
