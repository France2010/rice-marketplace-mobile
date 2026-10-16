import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from '../api/client';

function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

export async function registerForPushNotifications() {
  // Skip entirely in Expo Go
  if (isExpoGo()) {
    console.log('Push skipped (Expo Go)');
    return null;
  }

  if (!Device.isDevice) {
    console.log('Push requires a real device');
    return null;
  }

  // Lazy-load expo-notifications ONLY in real builds
  const Notifications = require('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      final = status;
    }
    if (final !== 'granted') {
      console.log('Push permission denied');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2e7d32',
      });
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await api.post('/notifications/register-token', { token });
    console.log('Push token:', token);
    return token;
  } catch (e) {
    console.warn('Push registration failed:', e.message);
    return null;
  }
}