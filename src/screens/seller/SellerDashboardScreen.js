import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function SellerDashboardScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/orders/seller/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const maxRev = Math.max(...(stats?.last7.map((d) => Number(d.revenue)) || [1]), 1);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.welcome}>Karibu, {user?.full_name}</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{stats?.totals.total_orders || 0}</Text>
          <Text style={styles.cardLabel}>Oda</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNum}>
            TZS {Number(stats?.totals.total_revenue || 0).toLocaleString()}
          </Text>
          <Text style={styles.cardLabel}>Mapato</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{stats?.totals.pending || 0}</Text>
          <Text style={styles.cardLabel}>Zinasubiri</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{stats?.totals.completed || 0}</Text>
          <Text style={styles.cardLabel}>Zilizokamilika</Text>
        </View>
      </View>

      <Text style={styles.section}>Mauzo ya Siku 7</Text>
      <View style={styles.chart}>
        {(stats?.last7 || []).map((d, i) => {
          const h = (Number(d.revenue) / maxRev) * 100;
          return (
            <View key={i} style={styles.barWrap}>
              <View style={[styles.bar, { height: Math.max(h, 3) }]} />
              <Text style={styles.barLabel}>{d.day.slice(5)}</Text>
            </View>
          );
        })}
        {(!stats?.last7 || stats.last7.length === 0) && (
          <Text style={{ color: '#888' }}>Hakuna mauzo bado</Text>
        )}
      </View>

      <Text style={styles.section}>Bidhaa Zinazoongoza</Text>
      {(stats?.topProducts || []).map((p, i) => (
        <View key={i} style={styles.topRow}>
          <Text style={styles.topName}>{p.name}</Text>
          <Text style={styles.topKg}>{p.kg_sold} kg</Text>
          <Text style={styles.topRev}>TZS {Number(p.revenue).toLocaleString()}</Text>
        </View>
      ))}
      {(!stats?.topProducts || stats.topProducts.length === 0) && (
        <Text style={{ color: '#888' }}>Bado hakuna data</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  welcome: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
  cardNum: { fontSize: 18, fontWeight: '700', color: '#2e7d32', textAlign: 'center' },
  cardLabel: { color: '#666', marginTop: 6, fontSize: 12 },
  section: { fontWeight: '700', marginTop: 24, marginBottom: 10, fontSize: 16 },
  chart: {
    flexDirection: 'row', alignItems: 'flex-end', height: 140,
    backgroundColor: '#fff', padding: 12, borderRadius: 12,
  },
  barWrap: { flex: 1, alignItems: 'center' },
  bar: { width: '60%', backgroundColor: '#2e7d32', borderRadius: 4 },
  barLabel: { fontSize: 10, color: '#666', marginTop: 6 },
  topRow: {
    backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  topName: { flex: 1, fontWeight: '600' },
  topKg: { color: '#666', fontSize: 12 },
  topRev: { color: '#2e7d32', fontWeight: '700', fontSize: 12 },
});