import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ☁️ Cloud backend
const HOST = 'https://rice-marketplace-api.onrender.com';
const BASE_URL = `${HOST}/api`;

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${HOST}${url}`;
};

export default api;