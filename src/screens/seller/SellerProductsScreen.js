import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';

export default function SellerProductsScreen({ navigation }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  const load = () =>
    api.get('/products/mine').then((r) => setItems(r.data)).catch(() => {});

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const stockColor = (kg) => {
    const n = Number(kg || 0);
    if (n === 0) return '#c62828'; // red — out of stock
    if (n < 20) return '#ef6c00'; // orange — low
    return '#2e7d32'; // green — healthy
  };

  const stockLabel = (kg) => {
    const n = Number(kg || 0);
    if (n === 0) return 'Imeisha';
    if (n < 20) return 'Inakaribia kuisha';
    return '';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <TouchableOpacity style={styles.add} onPress={() => navigation.navigate('AddProduct')}>
        <Text style={styles.addText}>+ {t('add_product')}</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const qty = Number(item.quantity_kg || 0);
          return (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.stock, { color: stockColor(qty) }]}>
                  {qty} kg
                </Text>
              </View>

              <Text style={styles.meta}>
                TZS {Number(item.price_per_kg || 0).toLocaleString()} /kg
              </Text>

              {qty < 20 && (
                <Text style={[styles.warning, { color: stockColor(qty) }]}>
                  ⚠️ {stockLabel(qty)}
                </Text>
              )}

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={() => navigation.navigate('UpdateStock', { product: item })}
                >
                  <Text style={styles.btnText}>📦 Update Stock</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
            Hakuna bidhaa bado
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  add: { backgroundColor: '#2e7d32', margin: 12, padding: 14, borderRadius: 8, alignItems: 'center' },
  addText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '700', fontSize: 16, flex: 1, marginRight: 8 },
  stock: { fontWeight: '700', fontSize: 15 },
  meta: { color: '#666', marginTop: 6 },
  warning: { marginTop: 6, fontWeight: '600', fontSize: 13 },
  btnRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  btnPrimary: {
    flex: 1, backgroundColor: '#2e7d32',
    padding: 10, borderRadius: 6, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },
});