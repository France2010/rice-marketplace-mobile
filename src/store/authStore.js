import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { registerForPushNotifications } from '../utils/push';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: true,

  loadSession: async () => {
    const token = await AsyncStorage.getItem('token');
    const userRaw = await AsyncStorage.getItem('user');
    if (token && userRaw) {
      set({ token, user: JSON.parse(userRaw), loading: false });
      registerForPushNotifications().catch(() => {});
    } else {
      set({ loading: false });
    }
  },

  login: async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
    registerForPushNotifications().catch(() => {});
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
    registerForPushNotifications().catch(() => {});
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    set({ user: null, token: null });
  },
}));