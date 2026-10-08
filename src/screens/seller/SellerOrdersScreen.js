import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';

export default function SellerOrdersScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);

  const load = () => api.get('/orders/seller').then((r) => setOrders(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      load();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
  };

  const payLabel = (m) => (m === 'MOBILE_MONEY' ? '📱 Mobile Money' : '💵 COD');

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 12 }}>
      <FlatList
        data={orders}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.num}>#{item.order_number}</Text>
            <Text style={styles.meta}>{item.status} • {payLabel(item.payment_method)}</Text>
            <Text style={styles.meta}>TZS {Number(item.total).toLocaleString()}</Text>

            {item.status === 'PENDING' && (
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.btn, styles.accept]} onPress={() => updateStatus(item.id, 'ACCEPTED')}>
                  <Text style={styles.btnText}>{t('accept')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.reject]} onPress={() => updateStatus(item.id, 'REJECTED')}>
                  <Text style={styles.btnText}>{t('reject')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === 'PAID' && (
              <TouchableOpacity style={[styles.btn, styles.accept]} onPress={() => updateStatus(item.id, 'READY')}>
                <Text style={styles.btnText}>Mark READY</Text>
              </TouchableOpacity>
            )}

            {item.status === 'READY' && (
              <TouchableOpacity style={[styles.btn, styles.accept]} onPress={() => updateStatus(item.id, 'OUT_FOR_DELIVERY')}>
                <Text style={styles.btnText}>Out for Delivery</Text>
              </TouchableOpacity>
            )}

            {item.status === 'OUT_FOR_DELIVERY' && (
              <TouchableOpacity style={[styles.btn, styles.accept]} onPress={() => updateStatus(item.id, 'COMPLETED')}>
                <Text style={styles.btnText}>Complete</Text>
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
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { padding: 10, borderRadius: 6, alignItems: 'center', flex: 1, marginTop: 10 },
  accept: { backgroundColor: '#2e7d32' },
  reject: { backgroundColor: '#c62828' },
  btnText: { color: '#fff', fontWeight: '600' },
});