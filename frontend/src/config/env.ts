// Environment configuration with type safety and validation

interface EnvironmentConfig {
  // Application
  APP_NAME: string;
  APP_VERSION: string;
  APP_DESCRIPTION: string;
  
  // API
  API_BASE_URL: string;
  API_TIMEOUT: number;
  BACKEND_API_BASE_URL: string;
  
  // Features
  ENABLE_DEBUG: boolean;
  ENABLE_MOCK_DATA: boolean;
  
  // Theme
  DEFAULT_THEME: string;
  THEME_STORAGE_KEY: string;
  
  // Cache
  CACHE_DURATION: number;
  
  // Development
  DEV_TOOLS: boolean;
  MOCK_DELAY: number;
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_UPLOAD_PRESET: string;

  // EmailJS
  EMAILJS_SERVICE_ID: string;
  EMAILJS_TEMPLATE_ID: string;
  EMAILJS_USER_KEY: string;
  EMAILJS_ADMIN_EMAIL: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;
  if (!value) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  return value;
};

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

const getNumberEnvVar = (key: string, defaultValue: number = 0): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const env: EnvironmentConfig = {
  // Application
  APP_NAME: getEnvVar('VITE_APP_NAME', 'Table API Integration'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '0.0.0'),
  APP_DESCRIPTION: getEnvVar('VITE_APP_DESCRIPTION', 'React Dashboard with API Integration'),
  
  // API
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://dummyjson.com'),
  API_TIMEOUT: getNumberEnvVar('VITE_API_TIMEOUT', 10000),
  BACKEND_API_BASE_URL: getEnvVar('VITE_BACKEND_API_BASE_URL', 'http://localhost:3000/api'),
  
  // Features
  ENABLE_DEBUG: getBooleanEnvVar('VITE_ENABLE_DEBUG', true),
  ENABLE_MOCK_DATA: getBooleanEnvVar('VITE_ENABLE_MOCK_DATA', false),
  
  // Theme
  DEFAULT_THEME: getEnvVar('VITE_DEFAULT_THEME', 'light'),
  THEME_STORAGE_KEY: getEnvVar('VITE_THEME_STORAGE_KEY', 'vite-ui-theme'),
  
  // Cache
  CACHE_DURATION: getNumberEnvVar('VITE_CACHE_DURATION', 300000),
  
  // Development
  DEV_TOOLS: getBooleanEnvVar('VITE_DEV_TOOLS', true),
  MOCK_DELAY: getNumberEnvVar('VITE_MOCK_DELAY', 1000),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnvVar('VITE_CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: getEnvVar('VITE_CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: getEnvVar('VITE_CLOUDINARY_API_SECRET', ''),
  CLOUDINARY_UPLOAD_PRESET: getEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET', ''),

  // EmailJS
  EMAILJS_SERVICE_ID: getEnvVar('VITE_EMAILJS_SERVICE_ID', 'service_rfumt7n'),
  EMAILJS_TEMPLATE_ID: getEnvVar('VITE_EMAILJS_TEMPLATE_ID', ''),
  EMAILJS_USER_KEY: getEnvVar('VITE_EMAILJS_KEY', ''),
  EMAILJS_ADMIN_EMAIL: getEnvVar('VITE_EMAILJS_ADMIN_EMAIL', ''),
};

export default env;