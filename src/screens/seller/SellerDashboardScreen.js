import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function SellerDashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      api.get('/orders/seller/stats')
        .then((r) => setStats(r.data))
        .catch(() => {});
    }, [])
  );

  const goToOrders = (filter) => {
    navigation.navigate('Orders', { filter, _ts: Date.now() });
  };

  const build7Days = () => {
    const days = [];
    const map = {};
    (stats?.last7 || []).forEach((d) => {
      const key = String(d.day).slice(0, 10);
      map[key] = Number(d.revenue);
    });
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        day: key,
        label: d.toLocaleDateString('sw-TZ', { weekday: 'short' }).slice(0, 3),
        revenue: map[key] || 0,
      });
    }
    return days;
  };

  const days = build7Days();
  const maxRev = Math.max(...days.map((d) => d.revenue), 1);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={styles.welcome}>Karibu, {user?.full_name}</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => goToOrders('ALL')}>
          <Text style={styles.cardNum}>{stats?.totals.total_orders || 0}</Text>
          <Text style={styles.cardLabel}>Oda Zote</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => goToOrders('ALL')}>
          <Text style={styles.cardNum} numberOfLines={1} adjustsFontSizeToFit>
            TZS {Number(stats?.totals.total_revenue || 0).toLocaleString()}
          </Text>
          <Text style={styles.cardLabel}>Mapato</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => goToOrders('PENDING')}>
          <Text style={[styles.cardNum, { color: '#f57c00' }]}>
            {stats?.totals.pending || 0}
          </Text>
          <Text style={styles.cardLabel}>Zinasubiri</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => goToOrders('COMPLETED')}>
          <Text style={[styles.cardNum, { color: '#2e7d32' }]}>
            {stats?.totals.completed || 0}
          </Text>
          <Text style={styles.cardLabel}>Zilizokamilika</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>📊 Mauzo ya Siku 7</Text>
      <View style={styles.chartBox}>
        <View style={styles.chartArea}>
          {days.map((d, i) => {
            const h = d.revenue > 0 ? Math.max((d.revenue / maxRev) * 100, 8) : 3;
            return (
              <View key={i} style={styles.barWrap}>
                {d.revenue > 0 && (
                  <Text style={styles.barValue}>
                    {(d.revenue / 1000).toFixed(0)}k
                  </Text>
                )}
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${h}%`,
                      backgroundColor: d.revenue > 0 ? '#2e7d32' : '#e0e0e0',
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{d.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Text style={styles.section}>🏆 Bidhaa Zinazoongoza</Text>
      {(stats?.topProducts || []).length === 0 ? (
        <Text style={{ color: '#888', textAlign: 'center', marginTop: 12 }}>
          Bado hakuna data
        </Text>
      ) : (
        (stats?.topProducts || []).map((p, i) => (
          <View key={i} style={styles.topRow}>
            <View style={styles.rankCircle}>
              <Text style={styles.rankText}>{i + 1}</Text>
            </View>
            <Text style={styles.topName} numberOfLines={1}>{p.name}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.topKg}>{p.kg_sold} kg</Text>
              <Text style={styles.topRev}>
                TZS {Number(p.revenue).toLocaleString()}
              </Text>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  welcome: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12,
    alignItems: 'center', elevation: 1,
  },
  cardNum: { fontSize: 20, fontWeight: '700', color: '#2e7d32', textAlign: 'center' },
  cardLabel: { color: '#666', marginTop: 6, fontSize: 12 },

  section: { fontWeight: '700', marginTop: 24, marginBottom: 10, fontSize: 15 },

  chartBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    height: 200,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  barWrap: {
    flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end',
  },
  bar: { width: '80%', borderRadius: 4, minHeight: 3 },
  barValue: { fontSize: 10, color: '#2e7d32', fontWeight: '700', marginBottom: 4 },
  barLabel: { fontSize: 11, color: '#666', marginTop: 6 },

  topRow: {
    backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  rankCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontWeight: '700', color: '#2e7d32' },
  topName: { flex: 1, fontWeight: '600' },
  topKg: { color: '#666', fontSize: 12 },
  topRev: { color: '#2e7d32', fontWeight: '700', fontSize: 12 },
});