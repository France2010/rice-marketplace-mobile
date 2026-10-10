const db = require('../config/db');
const { Expo } = require('expo-server-sdk');

let expo = null;
function getExpo() {
  if (!expo) expo = new Expo();
  return expo;
}

async function sendPushToUser(userId, title, body, data = {}) {
  try {
    const r = await db.query(
      'SELECT expo_push_token FROM users WHERE id=$1',
      [userId]
    );
    const token = r.rows[0]?.expo_push_token;
    if (!token) return;

    if (!Expo.isExpoPushToken(token)) {
      console.warn('Invalid push token for user', userId);
      return;
    }

    const messages = [{
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default',
    }];

    const chunks = getExpo().chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await getExpo().sendPushNotificationsAsync(chunk);
      } catch (err) {
        console.error('Send push error:', err.message);
      }
    }
  } catch (e) {
    console.error('Push error:', e.message);
  }
}

module.exports = { sendPushToUser };