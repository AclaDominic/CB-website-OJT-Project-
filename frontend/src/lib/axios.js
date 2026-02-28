import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
  withCredentials: true,
  withXSRFToken: true,
});

// Cache Configuration
const CACHE_PREFIX = "cc_api_cache_";

// Endpoints that are safe to cache (public data)
const CACHEABLE_ENDPOINTS = [
  "/api/page-contents",
  "/api/services",
  "/api/projects",
  "/api/machineries",
  "/api/development-sites",
  "/api/organization-members",
];

const isCacheable = (url) => {
  if (!url) return false;
  // Make sure it matches one of our safe public endpoints
  return CACHEABLE_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

export const clearCache = () => {
  // Clear all localStorage keys that start with our prefix
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

// Store Original Methods
const originalGet = axiosClient.get;
const originalPost = axiosClient.post;
const originalPut = axiosClient.put;
const originalPatch = axiosClient.patch;
const originalDelete = axiosClient.delete;

// Wrap GET to support localStorage caching
axiosClient.get = async (url, config) => {
  if (isCacheable(url)) {
    // Generate a unique cache key based on the URL and params
    const cacheKey = `${CACHE_PREFIX}${url}${
      config?.params ? JSON.stringify(config.params) : ""
    }`;

    // 1. Try to serve from cache
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        // Return a mock Axios response containing our cached data
        return Promise.resolve({
          data: parsed,
          status: 200,
          statusText: "OK",
          headers: {},
          config: config || {},
          request: {},
        });
      } catch (e) {
        // If data is corrupted, wipe it and fallback to network
        localStorage.removeItem(cacheKey);
      }
    }

    // 2. Fallback: Fetch from network
    const response = await originalGet.call(axiosClient, url, config);

    // 3. Save to cache for next time
    try {
      if (response.data) {
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
      }
    } catch (e) {
      console.warn("Could not write to localStorage cache", e);
    }

    return response;
  }

  // Not cacheable, pass through normally
  return originalGet.call(axiosClient, url, config);
};

// Wrap Mutations to auto-invalidate the cache
const createInvalidatingWrapper = (originalMethod) => {
  return async (url, data, config) => {
    // Before performing any mutation (Create, Update, Delete) to the server...
    clearCache();
    // Proceed with the actual request
    return originalMethod.call(axiosClient, url, data, config);
  };
};

axiosClient.post = createInvalidatingWrapper(originalPost);
axiosClient.put = createInvalidatingWrapper(originalPut);
axiosClient.patch = createInvalidatingWrapper(originalPatch);

// DELETE expects originalDelete.call(axiosClient, url, config) (no data arg natively)
axiosClient.delete = async (url, config) => {
  clearCache();
  return originalDelete.call(axiosClient, url, config);
};

export default axiosClient;
