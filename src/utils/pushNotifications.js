import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import api from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPush() {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  try {
    await api.post('/notifications/register-token', { token });
  } catch (e) {}
  return token;
}