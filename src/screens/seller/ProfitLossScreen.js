import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';

export default function ProfitLossScreen() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    api.get('/orders/seller/profit-loss')
      .then((r) => setData(r.data))
      .catch(() => {});
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    load();
    setRefreshing(false);
  };

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  const totals = data.totals;
  const profitMargin = Number(totals.revenue) > 0
    ? ((Number(totals.profit) / Number(totals.revenue)) * 100).toFixed(1)
    : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.bigCard}>
        <Text style={styles.label}>Faida (Profit)</Text>
        <Text style={[styles.big, { color: Number(totals.profit) >= 0 ? '#2e7d32' : '#c62828' }]}>
          TZS {Number(totals.profit).toLocaleString()}
        </Text>
        <Text style={styles.sub}>Margin: {profitMargin}%</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>Mapato</Text>
          <Text style={styles.value}>TZS {Number(totals.revenue).toLocaleString()}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Gharama</Text>
          <Text style={styles.value}>TZS {Number(totals.total_cost).toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Oda Zilizokamilika</Text>
        <Text style={styles.value}>{totals.orders_count}</Text>
      </View>

      <Text style={styles.section}>📦 Faida kwa Bidhaa</Text>
      {data.perProduct.length === 0 && (
        <Text style={styles.empty}>Hakuna mauzo bado</Text>
      )}
      {data.perProduct.map((p) => (
        <View key={p.id} style={styles.productCard}>
          <Text style={styles.productName}>{p.name}</Text>
          <View style={styles.productRow}>
            <Text style={styles.productMeta}>{p.total_kg} kg</Text>
            <Text style={styles.productMeta}>
              Rev: TZS {Number(p.revenue).toLocaleString()}
            </Text>
          </View>
          <View style={styles.productRow}>
            <Text style={styles.productMeta}>
              Cost: TZS {Number(p.cost).toLocaleString()}
            </Text>
            <Text
              style={[
                styles.profit,
                { color: Number(p.profit) >= 0 ? '#2e7d32' : '#c62828' },
              ]}
            >
              {Number(p.profit) >= 0 ? '📈' : '📉'} TZS {Number(p.profit).toLocaleString()}
            </Text>
          </View>
          <Text style={styles.marginText}>Margin: {p.margin_percent}%</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bigCard: {
    backgroundColor: '#fff', padding: 20, borderRadius: 12,
    marginBottom: 12, alignItems: 'center',
  },
  label: { color: '#666', fontSize: 13, fontWeight: '600' },
  big: { fontSize: 28, fontWeight: '700', marginTop: 6 },
  sub: { color: '#888', marginTop: 4 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 12,
  },
  value: { fontSize: 18, fontWeight: '700', color: '#2e7d32', marginTop: 6, textAlign: 'center' },
  section: { fontWeight: '700', fontSize: 16, marginTop: 12, marginBottom: 10 },
  empty: { textAlign: 'center', color: '#888', marginTop: 12 },
  productCard: {
    backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10,
  },
  productName: { fontWeight: '700', fontSize: 15 },
  productRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 6,
  },
  productMeta: { color: '#666', fontSize: 12 },
  profit: { fontWeight: '700', fontSize: 13 },
  marginText: { color: '#888', fontSize: 12, marginTop: 6 },
});