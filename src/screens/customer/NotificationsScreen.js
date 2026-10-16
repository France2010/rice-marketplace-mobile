import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';

export default function NotificationsScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = () =>
    api.get('/notifications/mine').then((r) => setItems(r.data)).catch(() => {});

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, is_read: true } : it))
      );
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setItems((prev) => prev.map((it) => ({ ...it, is_read: true })));
    } catch (e) {}
  };

  const deleteOne = (id) => {
    Alert.alert(
      'Ondoa taarifa?',
      'Taarifa hii itaondolewa kabisa.',
      [
        { text: 'Hapana', style: 'cancel' },
        {
          text: 'Ondoa',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/notifications/${id}`);
              setItems((prev) => prev.filter((it) => it.id !== id));
            } catch (e) {
              Alert.alert('Error', e.response?.data?.error || e.message);
            }
          },
        },
      ]
    );
  };

  const deleteAll = () => {
    if (items.length === 0) return;
    Alert.alert(
      'Ondoa taarifa zote?',
      `Taarifa zote ${items.length} zitaondolewa kabisa.`,
      [
        { text: 'Hapana', style: 'cancel' },
        {
          text: 'Ondoa Zote',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/notifications');
              setItems([]);
            } catch (e) {
              Alert.alert('Error', e.response?.data?.error || e.message);
            }
          },
        },
      ]
    );
  };

  const unread = items.filter((i) => !i.is_read).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topTitle}>Taarifa</Text>
          {unread > 0 && (
            <Text style={styles.unreadText}>{unread} mpya</Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {unread > 0 && (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={styles.markAll}>Soma zote</Text>
            </TouchableOpacity>
          )}
          {items.length > 0 && (
            <TouchableOpacity onPress={deleteAll}>
              <Text style={styles.deleteAll}>Ondoa zote</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={[styles.card, !item.is_read && styles.unread]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => markRead(item.id)}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteOne(item.id)}
            >
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
            {!item.is_read && <View style={styles.dot} />}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Hakuna taarifa bado</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  topTitle: { fontSize: 18, fontWeight: '700' },
  unreadText: { color: '#2e7d32', fontSize: 12, marginTop: 2, fontWeight: '600' },
  markAll: { color: '#2e7d32', fontWeight: '600' },
  deleteAll: { color: '#c62828', fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 14, borderRadius: 10, marginBottom: 10,
    borderLeftWidth: 3, borderLeftColor: '#eee',
  },
  unread: { borderLeftColor: '#2e7d32', backgroundColor: '#f1f8e9' },
  title: { fontWeight: '700', fontSize: 15 },
  body: { color: '#444', marginTop: 4 },
  time: { color: '#999', marginTop: 6, fontSize: 12 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#2e7d32', marginLeft: 8,
  },
  deleteBtn: {
    paddingHorizontal: 10, paddingVertical: 8, marginLeft: 4,
  },
  deleteBtnText: { fontSize: 20 },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
});