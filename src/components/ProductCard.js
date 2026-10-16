import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import api, { fullImageUrl } from '../api/client';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';

export default function ProductCard({ product, onPress, compact, cardWidth }) {
  const { t } = useTranslation();
  const img = fullImageUrl(product.image_url) || DEFAULT_IMG;
  const [fav, setFav] = useState(false);

  useEffect(() => {
    api.get(`/favorites/check/${product.id}`)
      .then((r) => setFav(r.data.favorite))
      .catch(() => {});
  }, [product.id]);

  const toggleFav = async () => {
    try {
      const { data } = await api.post('/favorites/toggle', { product_id: product.id });
      setFav(data.favorite);
    } catch (e) {}
  };

  const priceStr = Number(product.price_per_kg || 0).toLocaleString();
  const stockStr = product.quantity_kg ?? 0;
  const outOfStock = Number(stockStr) === 0;

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.cardCompact,
          cardWidth ? { width: cardWidth } : { flex: 1 },
          outOfStock && styles.cardDisabled,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View>
          <Image source={{ uri: img }} style={styles.imageCompact} />
          <TouchableOpacity style={styles.heartSmall} onPress={toggleFav}>
            <Text style={{ fontSize: 14 }}>{fav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          {outOfStock && (
            <View style={styles.outBadge}>
              <Text style={styles.outText}>Imeisha</Text>
            </View>
          )}
        </View>

        <View style={styles.bodyCompact}>
          <Text style={styles.nameCompact} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.priceCompact} numberOfLines={1}>
            TZS {priceStr}
          </Text>
          <Text style={styles.stockCompact} numberOfLines={1}>
            {stockStr} kg
          </Text>
          {product.avg_rating && (
            <Text style={styles.ratingCompact}>⭐ {product.avg_rating}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

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
          <Text style={styles.price}>TZS {priceStr} /kg</Text>
          <Text style={styles.stock}>{stockStr} kg</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  /* Compact (grid) */
  cardCompact: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardDisabled: { opacity: 0.6 },
  imageCompact: { width: '100%', height: 100, backgroundColor: '#eee' },
  heartSmall: {
    position: 'absolute', top: 4, right: 4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  outBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: '#c62828',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  outText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  bodyCompact: { padding: 6 },
  nameCompact: { fontSize: 12, fontWeight: '600', minHeight: 32 },
  priceCompact: { color: '#2e7d32', fontWeight: '700', fontSize: 13, marginTop: 4 },
  stockCompact: { color: '#888', fontSize: 11, marginTop: 2 },
  ratingCompact: { color: '#f57c00', fontSize: 10, marginTop: 2 },

  /* Full width (default) */
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
  },
  image: { height: 180, width: '100%', backgroundColor: '#eee' },
  heart: {
    position: 'absolute', top: 8, right: 8,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: { fontWeight: '700', fontSize: 12 },
  body: { padding: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', marginTop: 2 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 8,
  },
  price: { color: '#2e7d32', fontWeight: '700' },
  stock: { color: '#888' },
});