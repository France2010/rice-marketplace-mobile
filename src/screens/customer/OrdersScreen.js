import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../../api/client';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);

  const load = () => api.get('/orders/mine').then((r) => setOrders(r.data)).catch(() => {});
  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

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

            {item.status === 'PENDING' && (
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.editBtn]}
                  onPress={() =>
                    navigation.navigate('Shop', {
                      screen: 'EditOrder',
                      params: { orderId: item.id },
                    })
                  }
                >
                  <Text style={styles.editText}>✏️ Badilisha</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={() => cancelOrder(item.id)}
                >
                  <Text style={styles.cancelText}>❌ Futa</Text>
                </TouchableOpacity>
              </View>
            )}
{item.status === 'COMPLETED' && (
  <TouchableOpacity
    style={[styles.btn, { borderColor: '#fbc02d', backgroundColor: '#fff8e1', marginTop: 8 }]}
    onPress={() => navigation.navigate('Shop', {
      screen: 'Review',
      params: { orderId: item.id },
    })}
  >
    <Text style={{ color: '#f57c00', fontWeight: '700' }}>⭐ Toa Maoni</Text>
  </TouchableOpacity>
)}
            {item.status === 'AWAITING_PAYMENT' && (
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={() => cancelOrder(item.id)}
              >
                <Text style={styles.cancelText}>Futa Oda</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40 }}>Hakuna oda bado</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10 },
  num: { fontWeight: '700' },
  meta: { color: '#666', marginTop: 4 },
  total: { color: '#2e7d32', fontWeight: '700', marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { flex: 1, padding: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1 },
  editBtn: { borderColor: '#2e7d32', backgroundColor: '#e8f5e9' },
  editText: { color: '#2e7d32', fontWeight: '600' },
  cancelBtn: { borderColor: '#c62828', backgroundColor: '#ffebee' },
  cancelText: { color: '#c62828', fontWeight: '600' },
});