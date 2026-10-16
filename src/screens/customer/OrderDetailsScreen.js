import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { fullImageUrl } from '../../api/client';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200';

export default function OrderDetailsScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get(`/orders/${orderId}`)
      .then((r) => setOrder(r.data))
      .catch((e) => {
        Alert.alert('Error', e.response?.data?.error || e.message);
      })
      .finally(() => setLoading(false));

  useFocusEffect(
    useCallback(() => {
      load();
    }, [orderId])
  );

  const statusInfo = (s) => {
    switch (s) {
      case 'AWAITING_PAYMENT': return { label: '⏳ Inasubiri Malipo', color: '#f57c00', bg: '#fff3e0' };
      case 'PENDING':          return { label: '🆕 Oda Mpya',          color: '#1976d2', bg: '#e3f2fd' };
      case 'PAID':             return { label: '💰 Imelipwa',          color: '#2e7d32', bg: '#e8f5e9' };
      case 'ACCEPTED':         return { label: '✅ Imekubaliwa',       color: '#2e7d32', bg: '#e8f5e9' };
      case 'READY':            return { label: '📦 Tayari',             color: '#2e7d32', bg: '#e8f5e9' };
      case 'OUT_FOR_DELIVERY': return { label: '🚚 Njiani',             color: '#0288d1', bg: '#e1f5fe' };
      case 'COMPLETED':        return { label: '🎉 Imekamilika',        color: '#1b5e20', bg: '#c8e6c9' };
      case 'CANCELLED':        return { label: '❌ Imefutwa',           color: '#c62828', bg: '#ffebee' };
      case 'REJECTED':         return { label: '❌ Imekataliwa',        color: '#c62828', bg: '#ffebee' };
      default: return { label: s, color: '#555', bg: '#f0f0f0' };
    }
  };

  const cancelOrder = () => {
    Alert.alert('Futa oda?', 'Una uhakika?', [
      { text: 'Hapana', style: 'cancel' },
      {
        text: 'Futa',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/orders/${orderId}/cancel`);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.error || e.message);
          }
        },
      },
    ]);
  };

  if (loading || !order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  const si = statusInfo(order.status);
  const canEdit = order.status === 'PENDING';
  const canCancel = ['PENDING', 'AWAITING_PAYMENT'].includes(order.status);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.orderNum}>#{order.order_number}</Text>
        <View style={[styles.badge, { backgroundColor: si.bg }]}>
          <Text style={[styles.badgeText, { color: si.color }]}>{si.label}</Text>
        </View>
      </View>

      {/* Items */}
      <Text style={styles.section}>Bidhaa ({order.items.length})</Text>
      {order.items.map((it) => (
        <View key={it.id} style={styles.itemRow}>
          <Image
            source={{ uri: fullImageUrl(it.image_url) || DEFAULT_IMG }}
            style={styles.thumb}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.itemName}>{it.name}</Text>
            <Text style={styles.itemMeta}>
              TZS {Number(it.unit_price).toLocaleString()} /kg
            </Text>
            <Text style={styles.itemQty}>{it.quantity_kg} kg</Text>
          </View>
          <Text style={styles.lineTotal}>
            TZS {Number(it.subtotal).toLocaleString()}
          </Text>
        </View>
      ))}

      {/* Summary */}
      <Text style={styles.section}>Muhtasari</Text>
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>TZS {Number(order.subtotal).toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Usafirishaji</Text>
          <Text>TZS {Number(order.delivery_fee).toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={{ fontWeight: '700' }}>Jumla</Text>
          <Text style={{ fontWeight: '700', color: '#2e7d32', fontSize: 18 }}>
            TZS {Number(order.total).toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Malipo</Text>
          <Text>
            {order.payment_method === 'MOBILE_MONEY' ? '📱 Mobile Money' : '💵 Lipa Ukifika'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      {(canEdit || canCancel) && (
        <View style={styles.actions}>
          {canEdit && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.editAction]}
              onPress={() =>
                navigation.navigate('EditOrder', { orderId: order.id })
              }
            >
              <Text style={styles.editActionText}>✏️ Badilisha Oda</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelAction]}
              onPress={cancelOrder}
            >
              <Text style={styles.cancelActionText}>❌ Futa Oda</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!canEdit && !canCancel && (
        <Text style={styles.lockedMsg}>
          {order.status === 'COMPLETED'
            ? '🎉 Oda imekamilika. Asante!'
            : '🔒 Oda haiwezi kubadilishwa tena.'}
        </Text>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  orderNum: { fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontWeight: '700', fontSize: 12 },
  section: {
    fontWeight: '700', marginTop: 16, marginBottom: 8,
    paddingHorizontal: 16, fontSize: 15,
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 12, marginHorizontal: 12,
    borderRadius: 10, marginBottom: 8,
  },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#eee' },
  itemName: { fontWeight: '600', fontSize: 15 },
  itemMeta: { color: '#666', fontSize: 12, marginTop: 2 },
  itemQty: { color: '#2e7d32', fontWeight: '700', marginTop: 4 },
  lineTotal: { fontWeight: '700', color: '#2e7d32', fontSize: 14 },
  summaryBox: {
    backgroundColor: '#fff', marginHorizontal: 12,
    padding: 14, borderRadius: 10,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalRow: {
    borderTopWidth: 1, borderTopColor: '#eee',
    marginTop: 6, paddingTop: 12,
  },
  actions: { paddingHorizontal: 12, marginTop: 16, gap: 10 },
  actionBtn: {
    padding: 14, borderRadius: 8, alignItems: 'center',
  },
  editAction: { backgroundColor: '#2e7d32' },
  editActionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelAction: { backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#c62828' },
  cancelActionText: { color: '#c62828', fontWeight: '700', fontSize: 15 },
  lockedMsg: {
    textAlign: 'center', color: '#888',
    marginTop: 24, paddingHorizontal: 24, fontStyle: 'italic',
  },
});