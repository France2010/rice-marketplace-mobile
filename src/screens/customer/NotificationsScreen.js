import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../../api/client';

export default function NotificationsScreen() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/notifications/mine').then((r) => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Hakuna taarifa</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10 },
  title: { fontWeight: '700' },
  body: { color: '#444', marginTop: 4 },
});