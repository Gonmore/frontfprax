import axios from 'axios';
import { tokenUtils } from './token-utils';
import { useAuthStore } from '@/stores/auth';

// ⚠️ CAMBIAR LA URL BASE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // ← Sin /api por defecto

// 🚀 LOGGING DETALLADO PARA DEBUGGING DE URLS
if (typeof window !== 'undefined') {
  console.log('🔗 ===== CONFIGURACIÓN DE API =====');
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🔗 NEXT_PUBLIC_API_URL env:', process.env.NEXT_PUBLIC_API_URL);
  console.log('🔗 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔗 Window location origin:', window.location.origin);
  console.log('🔗 Window location hostname:', window.location.hostname);
  console.log('🔗 =================================');
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = tokenUtils.getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Token was expired and removed
        console.log('🕒 No valid token available');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si es error 401 (no autorizado) o 403 (token expirado)
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.mensaje || error.response?.data?.message;
      
      // NO aplicar logout automático en rutas de autenticación (login/register)
      const isAuthRoute = error.config?.url?.includes('/api/auth/login') || 
                         error.config?.url?.includes('/api/auth/register');
      
      if (!isAuthRoute && (
        errorMessage?.includes('expirado') || 
        errorMessage?.includes('expired') || 
        errorMessage?.includes('invalid') ||
        errorMessage?.includes('inválido') ||
        error.response?.status === 401
      )) {
        
        console.log('🔥 Token expirado detectado, limpiando sesión...');
        
        // Limpiar localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('auth-storage');
          
          // Limpiar el store de Zustand
          const { logout } = useAuthStore.getState();
          logout();
          
          // Redirigir al login
          window.location.href = '/login?expired=true';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const onboardingApi = {
  checkStatus: () => {
    console.log('🔍 Calling checkStatus');
    return apiClient.get('/api/onboarding/status');
  },
  getNextStep: () => apiClient.get('/api/onboarding/next-step'),
  completeStep: (step: string) => apiClient.post('/api/onboarding/complete-step', { step }),
  getRecommendedOffers: () => apiClient.get('/api/onboarding/recommended-offers'),
};

export const authApi = {
  login: (credentials: { email: string; password: string }) => {
    return apiClient.post('/api/auth/login', credentials);
  },
  register: (userData: any) => {
    return apiClient.post('/api/auth/register', userData);
  },
  logout: () => 
    apiClient.post('/api/auth/logout'),
};

export default apiClient;
