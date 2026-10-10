import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/cartStore';
import { fullImageUrl } from '../../api/client';
import api from '../../api/client';
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800';

export default function ProductDetailsScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { product } = route.params;
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState('1');

  const price = Number(product.price_per_kg);
  const quantity = parseFloat(qty) || 0;
  const subtotal = price * quantity;
  const img = fullImageUrl(product.image_url) || DEFAULT_IMG;

  const onAdd = () => {
    if (quantity <= 0) return Alert.alert('', 'Weka kiasi sahihi');
    if (quantity > Number(product.quantity_kg)) return Alert.alert('', 'Stock haitoshi');
    addItem(product, quantity);
    Alert.alert('✔', t('add_to_cart'), [
      { text: 'OK' },
      { text: t('cart'), onPress: () => navigation.navigate('Cart') },
    ]);
  };
  // Add this state
const [reviews, setReviews] = useState({ reviews: [], avg: 0, count: 0 });

useEffect(() => {
  api.get(`/reviews/product/${product.id}`).then((r) => setReviews(r.data)).catch(() => {});
}, [product.id]);

// Add this JSX after the Add to Cart button
<View style={{ marginTop: 24 }}>
  <Text style={{ fontSize: 18, fontWeight: '700' }}>
    ⭐ {reviews.avg || '—'} ({reviews.count} reviews)
  </Text>
  {reviews.reviews.map((r) => (
    <View key={r.id} style={{ padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, marginTop: 8 }}>
      <Text style={{ fontWeight: '600' }}>{r.full_name}</Text>
      <Text style={{ color: '#fbc02d' }}>{'★'.repeat(r.rating)}</Text>
      {!!r.comment && <Text style={{ marginTop: 4 }}>{r.comment}</Text>}
    </View>
  ))}
</View>

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Image source={{ uri: img }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.grade}>{product.grade_name}</Text>
        <Text style={styles.price}>TZS {price.toLocaleString()} / kg</Text>
        <Text style={styles.stock}>{t('stock')}: {product.quantity_kg} kg</Text>
        {!!product.description && <Text style={styles.desc}>{product.description}</Text>}

        <Text style={styles.label}>{t('quantity_kg')}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={qty}
          onChangeText={setQty}
        />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('subtotal')}</Text>
          <Text style={styles.totalValue}>TZS {subtotal.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={onAdd}>
          <Text style={styles.btnText}>{t('add_to_cart')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 280, backgroundColor: '#eee' },
  body: { padding: 16 },
  name: { fontSize: 22, fontWeight: '700' },
  grade: { color: '#666', marginTop: 4 },
  price: { color: '#2e7d32', fontSize: 20, fontWeight: '700', marginTop: 10 },
  stock: { color: '#888', marginTop: 4 },
  desc: { marginTop: 12, color: '#444', lineHeight: 20 },
  label: { marginTop: 20, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#2e7d32' },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});