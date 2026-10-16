import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const { width } = useWindowDimensions();

  // 2 columns on normal phones, 3 on larger screens
  const columns = width >= 600 ? 3 : 2;

  const load = () =>
    api.get('/orders/mine').then((r) => setOrders(r.data)).catch(() => {});

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const payLabel = (m) => (m === 'MOBILE_MONEY' ? '📱 Mobile' : '💵 COD');

  const statusInfo = (s) => {
    switch (s) {
      case 'AWAITING_PAYMENT': return { label: '⏳ Inasubiri',   color: '#f57c00', bg: '#fff3e0' };
      case 'PENDING':          return { label: '🆕 Mpya',         color: '#1976d2', bg: '#e3f2fd' };
      case 'PAID':             return { label: '💰 Imelipwa',     color: '#2e7d32', bg: '#e8f5e9' };
      case 'ACCEPTED':         return { label: '✅ Imekubaliwa',  color: '#2e7d32', bg: '#e8f5e9' };
      case 'READY':            return { label: '📦 Tayari',        color: '#2e7d32', bg: '#e8f5e9' };
      case 'OUT_FOR_DELIVERY': return { label: '🚚 Njiani',        color: '#0288d1', bg: '#e1f5fe' };
      case 'COMPLETED':        return { label: '🎉 Imekamilika',   color: '#1b5e20', bg: '#c8e6c9' };
      case 'CANCELLED':        return { label: '❌ Imefutwa',      color: '#c62828', bg: '#ffebee' };
      case 'REJECTED':         return { label: '❌ Imekataliwa',   color: '#c62828', bg: '#ffebee' };
      default: return { label: s, color: '#555', bg: '#f0f0f0' };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{orders.length} oda</Text>
      </View>

      <FlatList
        data={orders}
        key={columns}
        numColumns={columns}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 8 }}
        columnWrapperStyle={{ gap: 8 }}
        renderItem={({ item }) => {
          const si = statusInfo(item.status);
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('Shop', {
                  screen: 'OrderDetails',
                  params: { orderId: item.id },
                })
              }
            >
              <Text style={styles.num} numberOfLines={1}>
                #{item.order_number.slice(-6)}
              </Text>

              <View style={[styles.badge, { backgroundColor: si.bg }]}>
                <Text
                  style={[styles.badgeText, { color: si.color }]}
                  numberOfLines={1}
                >
                  {si.label}
                </Text>
              </View>

              <Text style={styles.pay} numberOfLines={1}>
                {payLabel(item.payment_method)}
              </Text>

              <Text
                style={styles.total}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                TZS {Number(item.total).toLocaleString()}
              </Text>

              <Text style={styles.viewHint}>Ona maelezo →</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
            Hakuna oda bado
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { paddingHorizontal: 16, paddingVertical: 10 },
  summaryText: { color: '#666', fontWeight: '600', fontSize: 13 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 130,
  },
  num: { fontWeight: '700', fontSize: 13, marginBottom: 6 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: { fontWeight: '700', fontSize: 10 },
  pay: { color: '#666', fontSize: 11, marginBottom: 4 },
  total: { color: '#2e7d32', fontWeight: '700', fontSize: 14, marginBottom: 8 },
  viewHint: {
    color: '#1976d2', fontSize: 11,
    fontWeight: '600', marginTop: 'auto',
  },
});