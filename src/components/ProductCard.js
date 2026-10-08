import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { fullImageUrl } from '../api/client';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600';

export default function ProductCard({ product, onPress }) {
  const { t } = useTranslation();
  const img = fullImageUrl(product.image_url) || DEFAULT_IMG;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: img }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.meta}>{product.grade_name || ''}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>
            TZS {Number(product.price_per_kg || 0).toLocaleString()} /kg
          </Text>
          <Text style={styles.stock}>
            {t('stock')}: {product.quantity_kg ?? 0} kg
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 14, overflow: 'hidden', elevation: 2 },
  image: { height: 180, width: '100%', backgroundColor: '#eee' },
  body: { padding: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  price: { color: '#2e7d32', fontWeight: '700' },
  stock: { color: '#888' },
});