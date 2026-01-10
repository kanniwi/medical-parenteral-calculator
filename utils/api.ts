import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = __DEV__
  ? 'http://172.20.10.2:3001/api'  
  : 'https://your-production-server.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обрабатываем ошибки авторизации
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Токен истек или невалиден
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
}

export interface CalculationData {
  glucose_volume: number;
  glucose_concentration: number;
  amino_acids_volume: number;
  amino_acids_concentration: number;
  lipids_volume: number;
  lipids_concentration: number;
  glucose_grams: number;
  glucose_calories: number;
  amino_acids_grams: number;
  amino_acids_calories: number;
  lipids_grams: number;
  lipids_calories: number;
  total_calories: number;
  total_volume: number;
}

// Auth API
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    await AsyncStorage.setItem('auth_token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    await AsyncStorage.setItem('auth_token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },

  getStoredUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Calculations API
export const calculationsAPI = {
  create: async (data: CalculationData) => {
    const response = await api.post('/calculations', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/calculations');
    return response.data.calculations;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/calculations/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/calculations');
    return response.data;
  },
};

export default api;
