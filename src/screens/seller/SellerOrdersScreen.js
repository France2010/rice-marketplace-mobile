import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';

const FILTERS = [
  { key: 'ALL', label: 'Zote' },
  { key: 'PENDING', label: 'Mpya' },
  { key: 'ACCEPTED', label: 'Imekubaliwa' },
  { key: 'READY', label: 'Tayari' },
  { key: 'OUT_FOR_DELIVERY', label: 'Njiani' },
  { key: 'COMPLETED', label: 'Zilizokamilika' },
];

export default function SellerOrdersScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState(route?.params?.filter || 'ALL');
  const { width } = useWindowDimensions();

  const columns = width >= 600 ? 3 : 2;

  const load = () => {
    api.get('/orders/seller').then((r) => setOrders(r.data)).catch(() => {});
  };

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.filter) setFilter(route.params.filter);
      load();
    }, [route?.params?.filter])
  );

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      load();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
  };

  const openSetFee = (item) => {
    navigation.navigate('Products', {
      screen: 'SetDeliveryFee',
      params: { order: item },
    });
  };

  const payLabel = (m) => (m === 'MOBILE_MONEY' ? '📱 Mobile' : '💵 COD');

  const statusInfo = (s) => {
    switch (s) {
      case 'PENDING':          return { label: '🆕 Mpya',        color: '#1976d2', bg: '#e3f2fd' };
      case 'PAID':             return { label: '💰 Imelipwa',    color: '#2e7d32', bg: '#e8f5e9' };
      case 'ACCEPTED':         return { label: '✅ Imekubaliwa', color: '#2e7d32', bg: '#e8f5e9' };
      case 'READY':            return { label: '📦 Tayari',       color: '#2e7d32', bg: '#e8f5e9' };
      case 'OUT_FOR_DELIVERY': return { label: '🚚 Njiani',       color: '#0288d1', bg: '#e1f5fe' };
      case 'COMPLETED':        return { label: '🎉 Imekamilika',  color: '#1b5e20', bg: '#c8e6c9' };
      case 'CANCELLED':        return { label: '❌ Imefutwa',     color: '#c62828', bg: '#ffebee' };
      case 'REJECTED':         return { label: '❌ Imekataliwa',  color: '#c62828', bg: '#ffebee' };
      default: return { label: s, color: '#555', bg: '#f0f0f0' };
    }
  };

  const filtered = filter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === filter);

  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((s, o) => s + Number(o.total), 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(i) => i.key}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, filter === item.key && styles.chipActive]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={filter === item.key ? styles.chipActiveText : {}}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {filtered.length} oda • TZS {totalRevenue.toLocaleString()}
        </Text>
      </View>

      <FlatList
        data={filtered}
        key={columns}
        numColumns={columns}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 8 }}
        columnWrapperStyle={{ gap: 8 }}
        renderItem={({ item }) => {
          const si = statusInfo(item.status);
          const feeSet = Number(item.delivery_fee) > 0;
          const canSetFee = ['PENDING', 'PAID', 'ACCEPTED'].includes(item.status);
          return (
            <View style={styles.card}>
              <Text style={styles.num} numberOfLines={1}>
                #{item.order_number.slice(-6)}
              </Text>

              <View style={[styles.badge, { backgroundColor: si.bg }]}>
                <Text style={[styles.badgeText, { color: si.color }]} numberOfLines={1}>
                  {si.label}
                </Text>
              </View>

              <Text style={styles.pay} numberOfLines={1}>
                {payLabel(item.payment_method)}
              </Text>

              {!!item.delivery_region && (
                <Text style={styles.region} numberOfLines={1}>
                  📍 {item.delivery_region}
                </Text>
              )}

              <Text style={styles.total} numberOfLines={1} adjustsFontSizeToFit>
                TZS {Number(item.total).toLocaleString()}
              </Text>

              {feeSet && (
                <Text style={styles.feeSet} numberOfLines={1}>
                  🚚 +TZS {Number(item.delivery_fee).toLocaleString()}
                </Text>
              )}

              {canSetFee && (
                <TouchableOpacity
                  style={[styles.btn, styles.feeBtn]}
                  onPress={() => openSetFee(item)}
                >
                  <Text style={styles.feeBtnText} numberOfLines={1}>
                    {feeSet ? '🚚 Badilisha' : '🚚 Weka Usafiri'}
                  </Text>
                </TouchableOpacity>
              )}

              {item.status === 'PENDING' && (
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.accept]}
                    onPress={() => updateStatus(item.id, 'ACCEPTED')}
                  >
                    <Text style={styles.btnText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.reject]}
                    onPress={() => updateStatus(item.id, 'REJECTED')}
                  >
                    <Text style={styles.btnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.status === 'PAID' && (
                <TouchableOpacity
                  style={[styles.btn, styles.accept]}
                  onPress={() => updateStatus(item.id, 'READY')}
                >
                  <Text style={styles.btnText}>Tayari</Text>
                </TouchableOpacity>
              )}
              {item.status === 'READY' && (
                <TouchableOpacity
                  style={[styles.btn, styles.accept]}
                  onPress={() => updateStatus(item.id, 'OUT_FOR_DELIVERY')}
                >
                  <Text style={styles.btnText}>Njiani</Text>
                </TouchableOpacity>
              )}
              {item.status === 'OUT_FOR_DELIVERY' && (
                <TouchableOpacity
                  style={[styles.btn, styles.accept]}
                  onPress={() => updateStatus(item.id, 'COMPLETED')}
                >
                  <Text style={styles.btnText}>Kamilisha</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
            Hakuna oda
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    backgroundColor: '#fff', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fafafa',
  },
  chipActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  chipActiveText: { color: '#fff', fontWeight: '700' },
  summary: { paddingHorizontal: 16, paddingVertical: 10 },
  summaryText: { color: '#666', fontWeight: '600', fontSize: 13 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 140,
  },
  num: { fontWeight: '700', fontSize: 13, marginBottom: 6 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: { fontWeight: '700', fontSize: 10 },
  pay: { color: '#666', fontSize: 11, marginBottom: 2 },
  region: { color: '#1976d2', fontSize: 11, marginBottom: 4 },
  total: { color: '#2e7d32', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  feeSet: { color: '#f57c00', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  btnRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  btn: {
    padding: 8, borderRadius: 6,
    alignItems: 'center', marginTop: 6,
  },
  accept: { backgroundColor: '#2e7d32', flex: 1 },
  reject: { backgroundColor: '#c62828', flex: 1 },
  feeBtn: {
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    borderColor: '#f57c00',
  },
  feeBtnText: { color: '#e65100', fontWeight: '700', fontSize: 11 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});