import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../../api/client';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);

  const load = () => api.get('/orders/mine').then((r) => setOrders(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const payLabel = (m) => (m === 'MOBILE_MONEY' ? '📱 Mobile Money' : '💵 Lipa Ukifika');

  const statusLabel = (s) => {
    switch (s) {
      case 'AWAITING_PAYMENT': return '⏳ Inasubiri malipo';
      case 'PENDING': return '🆕 Mpya';
      case 'PAID': return '💰 Imelipwa';
      case 'ACCEPTED': return '✅ Imekubaliwa';
      case 'READY': return '📦 Tayari';
      case 'OUT_FOR_DELIVERY': return '🚚 Njiani';
      case 'COMPLETED': return '🎉 Imekamilika';
      case 'CANCELLED': return '❌ Imefutwa';
      case 'REJECTED': return '❌ Imekataliwa';
      default: return s;
    }
  };

  const cancelOrder = async (id) => {
    Alert.alert('Futa oda?', 'Una uhakika?', [
      { text: 'Hapana', style: 'cancel' },
      {
        text: 'Futa',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/orders/${id}/cancel`);
            load();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.error || e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 12 }}>
      <FlatList
        data={orders}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.num}>#{item.order_number}</Text>
            <Text style={styles.meta}>{statusLabel(item.status)}</Text>
            <Text style={styles.meta}>{payLabel(item.payment_method)}</Text>
            <Text style={styles.total}>TZS {Number(item.total).toLocaleString()}</Text>

            {item.status === 'AWAITING_PAYMENT' && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelOrder(item.id)}>
                <Text style={styles.cancelText}>Futa Oda</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Hakuna oda bado</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10 },
  num: { fontWeight: '700' },
  meta: { color: '#666', marginTop: 4 },
  total: { color: '#2e7d32', fontWeight: '700', marginTop: 4 },
  cancelBtn: {
    marginTop: 10, paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 6, borderWidth: 1, borderColor: '#c62828', alignSelf: 'flex-start',
  },
  cancelText: { color: '#c62828', fontWeight: '600' },
});