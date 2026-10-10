import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import api, { fullImageUrl } from '../api/client';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600';

export default function ProductCard({ product, onPress }) {
  const { t } = useTranslation();
  const img = fullImageUrl(product.image_url) || DEFAULT_IMG;
  const [fav, setFav] = useState(false);

  useEffect(() => {
    api.get(`/favorites/check/${product.id}`).then((r) => setFav(r.data.favorite)).catch(() => {});
  }, [product.id]);

  const toggleFav = async () => {
    try {
      const { data } = await api.post('/favorites/toggle', { product_id: product.id });
      setFav(data.favorite);
    } catch (e) {}
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Image source={{ uri: img }} style={styles.image} />
        <TouchableOpacity style={styles.heart} onPress={toggleFav}>
          <Text style={{ fontSize: 22 }}>{fav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        {product.avg_rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {product.avg_rating}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.meta}>{product.grade_name || ''}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>TZS {Number(product.price_per_kg || 0).toLocaleString()} /kg</Text>
          <Text style={styles.stock}>{t('stock')}: {product.quantity_kg ?? 0} kg</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 14, overflow: 'hidden', elevation: 2 },
  image: { height: 180, width: '100%', backgroundColor: '#eee' },
  heart: {
    position: 'absolute', top: 8, right: 8, width: 40, height: 40,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: { fontWeight: '700', fontSize: 12 },
  body: { padding: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  price: { color: '#2e7d32', fontWeight: '700' },
  stock: { color: '#888' },
});