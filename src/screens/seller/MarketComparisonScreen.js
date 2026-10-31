import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, useWindowDimensions, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';

export default function MarketComparisonScreen() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();

  const columns = width >= 600 ? 3 : 2;
  const CARD_GAP = 8;
  const H_PADDING = 12;
  const cardWidth = (width - H_PADDING * 2 - CARD_GAP * (columns - 1)) / columns;

  const load = () => {
    api.get('/orders/seller/market-prices')
      .then((r) => setData(r.data))
      .catch((e) => {
        console.error('Market error:', e.response?.data || e.message);
        setData({ market: [], myProducts: [] });
      });
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ paddingVertical: 8 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ paddingHorizontal: H_PADDING }}>
        <Text style={styles.title}>📈 Soko la Mchele</Text>
        <Text style={styles.subtitle}>Bei za wastani kwa kila kiwango</Text>
      </View>

      {/* Market grades grid */}
      <FlatList
        data={data.market}
        key={`grades-${columns}`}
        numColumns={columns}
        scrollEnabled={false}
        keyExtractor={(g) => String(g.grade_id)}
        contentContainerStyle={{ paddingHorizontal: H_PADDING }}
        columnWrapperStyle={{ gap: CARD_GAP }}
        renderItem={({ item: g }) => (
          <View style={[styles.marketCard, { width: cardWidth, marginBottom: CARD_GAP }]}>
            <Text style={styles.grade} numberOfLines={1}>{g.grade_name}</Text>
            <Text style={styles.avg} numberOfLines={1} adjustsFontSizeToFit>
              TZS {Number(g.avg_price).toLocaleString()}
            </Text>
            <Text style={styles.perKg}>kwa kilo</Text>

            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Chini</Text>
              <Text style={styles.rangeValue}>{Number(g.min_price).toLocaleString()}</Text>
            </View>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Juu</Text>
              <Text style={styles.rangeValue}>{Number(g.max_price).toLocaleString()}</Text>
            </View>

            <View style={styles.sellersBadge}>
              <Text style={styles.sellersText}>👥 {g.sellers_count}</Text>
            </View>
          </View>
        )}
      />

      <View style={{ paddingHorizontal: H_PADDING, marginTop: 16 }}>
        <Text style={styles.section}>Bidhaa Zako vs Soko</Text>
        {data.myProducts.length === 0 && (
          <Text style={styles.empty}>Huna bidhaa bado</Text>
        )}
      </View>

      {/* My products grid */}
      <FlatList
        data={data.myProducts}
        key={`mine-${columns}`}
        numColumns={columns}
        scrollEnabled={false}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ paddingHorizontal: H_PADDING }}
        columnWrapperStyle={{ gap: CARD_GAP }}
        renderItem={({ item: p }) => {
          const diff = p.diff;
          const diffColor =
            diff === null ? '#888' : diff > 0 ? '#c62828' : diff < 0 ? '#2e7d32' : '#555';
          const hint =
            diff === null ? '—'
            : diff > 0 ? `+TZS ${Number(diff).toLocaleString()} juu`
            : diff < 0 ? `-TZS ${Math.abs(Number(diff)).toLocaleString()} chini`
            : 'Sawa';

          return (
            <View style={[styles.myCard, { width: cardWidth, marginBottom: CARD_GAP }]}>
              <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
              <Text style={styles.gradeName} numberOfLines={1}>{p.grade_name}</Text>

              <View style={styles.compareBlock}>
                <Text style={styles.compareLabel}>Bei yako</Text>
                <Text style={styles.compareValue}>TZS {Number(p.my_price).toLocaleString()}</Text>
              </View>

              <View style={styles.compareBlock}>
                <Text style={styles.compareLabel}>Wastani</Text>
                <Text style={styles.compareValue}>TZS {Number(p.market_avg || 0).toLocaleString()}</Text>
              </View>

              <View style={[styles.hintBadge, { backgroundColor: diffColor + '22' }]}>
                <Text style={[styles.hint, { color: diffColor }]} numberOfLines={1}>
                  {hint}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#666', marginBottom: 12 },

  marketCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  grade: { fontWeight: '700', fontSize: 13 },
  avg: { color: '#2e7d32', fontSize: 16, fontWeight: '700', marginTop: 6 },
  perKg: { color: '#888', fontSize: 10 },
  rangeRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 4,
  },
  rangeLabel: { color: '#888', fontSize: 10 },
  rangeValue: { color: '#555', fontWeight: '600', fontSize: 10 },
  sellersBadge: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 3, paddingHorizontal: 6,
    borderRadius: 6, marginTop: 8, alignSelf: 'flex-start',
  },
  sellersText: { color: '#666', fontSize: 10, fontWeight: '600' },

  section: { fontWeight: '700', fontSize: 16, marginBottom: 8 },
  empty: { textAlign: 'center', color: '#888', marginTop: 8, marginBottom: 16 },

  myCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productName: { fontWeight: '700', fontSize: 12, minHeight: 30 },
  gradeName: { color: '#888', fontSize: 10, marginTop: 2 },
  compareBlock: { marginTop: 6 },
  compareLabel: { color: '#888', fontSize: 9 },
  compareValue: { fontWeight: '700', fontSize: 12, marginTop: 1 },
  hintBadge: {
    marginTop: 8, paddingVertical: 4, paddingHorizontal: 6,
    borderRadius: 6, alignItems: 'center',
  },
  hint: { fontSize: 10, fontWeight: '700' },
});