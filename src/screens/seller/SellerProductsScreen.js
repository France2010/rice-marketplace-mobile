import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  useWindowDimensions, Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api, { fullImageUrl } from '../../api/client';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300';

export default function SellerProductsScreen({ navigation }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const { width } = useWindowDimensions();

  // 2 columns on normal phones, 3 on larger screens
  const columns = width >= 600 ? 3 : 2;

  const load = () =>
    api.get('/products/mine').then((r) => setItems(r.data)).catch(() => {});

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const stockColor = (kg) => {
    const n = Number(kg || 0);
    if (n === 0) return '#c62828';
    if (n < 20) return '#f57c00';
    return '#2e7d32';
  };

  const stockLabel = (kg) => {
    const n = Number(kg || 0);
    if (n === 0) return 'Imeisha';
    if (n < 20) return 'Inakaribia kuisha';
    return '';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.addText}>+ {t('add_product')}</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        key={columns}
        numColumns={columns}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 6 }}
        columnWrapperStyle={{ gap: 6, justifyContent: 'flex-start' }}
        renderItem={({ item }) => {
          const qty = Number(item.quantity_kg || 0);
          const cardWidth =
            (width - 12 - 6 * (columns - 1)) / columns;
          return (
            <View style={[styles.card, { width: cardWidth }]}>
              <Image
                source={{ uri: fullImageUrl(item.image_url) || DEFAULT_IMG }}
                style={styles.image}
              />

              {qty < 20 && (
                <View
                  style={[
                    styles.warnBadge,
                    { backgroundColor: stockColor(qty) },
                  ]}
                >
                  <Text style={styles.warnText}>
                    {qty === 0 ? 'Imeisha' : 'Karibu kuisha'}
                  </Text>
                </View>
              )}

              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.price} numberOfLines={1}>
                  TZS {Number(item.price_per_kg || 0).toLocaleString()}
                </Text>
                <Text
                  style={[styles.stock, { color: stockColor(qty) }]}
                  numberOfLines={1}
                >
                  {qty} kg
                </Text>

                <TouchableOpacity
                  style={styles.updateBtn}
                  onPress={() =>
                    navigation.navigate('UpdateStock', { product: item })
                  }
                >
                  <Text style={styles.updateText}>📦 Update</Text>
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
  addBtn: {
    backgroundColor: '#2e7d32', margin: 12, padding: 14,
    borderRadius: 8, alignItems: 'center',
  },
  addText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: { width: '100%', height: 100, backgroundColor: '#eee' },
  warnBadge: {
    position: 'absolute', top: 4, left: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  warnText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  body: { padding: 8 },
  name: { fontSize: 12, fontWeight: '600', minHeight: 32 },
  price: { color: '#2e7d32', fontWeight: '700', fontSize: 13, marginTop: 4 },
  stock: { fontSize: 11, marginTop: 2 },
  updateBtn: {
    marginTop: 8, backgroundColor: '#e8f5e9',
    padding: 6, borderRadius: 6, alignItems: 'center',
  },
  updateText: { color: '#2e7d32', fontWeight: '700', fontSize: 11 },
});