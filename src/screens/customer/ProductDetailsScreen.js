import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/cartStore';
import api, { fullImageUrl } from '../../api/client';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800';

export default function ProductDetailsScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { product } = route.params;
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState('1');
  const [reviews, setReviews] = useState({ reviews: [], avg: 0, count: 0 });

  useEffect(() => {
    api.get(`/reviews/product/${product.id}`)
      .then((r) => setReviews(r.data))
      .catch(() => {});
  }, [product.id]);

  const price = Number(product.price_per_kg || 0);
  const quantity = parseFloat(qty) || 0;
  const subtotal = price * quantity;
  const img = fullImageUrl(product.image_url) || DEFAULT_IMG;

  const onAdd = () => {
    if (quantity <= 0) return Alert.alert('', 'Weka kiasi sahihi');
    if (quantity > Number(product.quantity_kg || 0))
      return Alert.alert('', 'Stock haitoshi');
    addItem(product, quantity);
    Alert.alert('✔', t('add_to_cart'), [
      { text: 'OK' },
      { text: t('cart'), onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const callSeller = () => {
    if (!product.seller_phone) return;
    Linking.openURL(`tel:${product.seller_phone}`);
  };

  const whatsappSeller = () => {
    if (!product.seller_phone) return;
    const phone = product.seller_phone.replace(/^0/, '');
    Linking.openURL(`https://wa.me/255${phone}`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Image source={{ uri: img }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.grade}>{product.grade_name || ''}</Text>
        <Text style={styles.price}>TZS {price.toLocaleString()} / kg</Text>
        <Text style={styles.stock}>
          {t('stock')}: {product.quantity_kg ?? 0} kg
        </Text>

        {!!product.description && (
          <Text style={styles.desc}>{product.description}</Text>
        )}

        {!!product.seller_phone && (
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: '#1976d2' }]}
              onPress={callSeller}
            >
              <Text style={styles.contactText}>📞 Piga</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: '#25d366' }]}
              onPress={whatsappSeller}
            >
              <Text style={styles.contactText}>💬 WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>{t('quantity_kg')}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={qty}
          onChangeText={setQty}
          placeholderTextColor="#888"
        />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('subtotal')}</Text>
          <Text style={styles.totalValue}>TZS {subtotal.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={onAdd}>
          <Text style={styles.btnText}>{t('add_to_cart')}</Text>
        </TouchableOpacity>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>
            ⭐ {reviews.avg || '—'} ({reviews.count} reviews)
          </Text>
          {reviews.reviews.length === 0 ? (
            <Text style={styles.noReviews}>Hakuna maoni bado</Text>
          ) : (
            reviews.reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <Text style={styles.reviewer}>{r.full_name}</Text>
                <Text style={styles.stars}>{'★'.repeat(r.rating)}</Text>
                {!!r.comment && <Text style={styles.comment}>{r.comment}</Text>}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
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
  contactRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  contactBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  contactText: { color: '#fff', fontWeight: '700' },
  label: { marginTop: 20, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginTop: 6, color: '#000',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#2e7d32' },
  btn: {
    backgroundColor: '#2e7d32', padding: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 20,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  reviewsSection: { marginTop: 32, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  noReviews: { color: '#888', fontStyle: 'italic' },
  reviewCard: {
    backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 8,
  },
  reviewer: { fontWeight: '600' },
  stars: { color: '#fbc02d', marginTop: 2 },
  comment: { marginTop: 4, color: '#333' },
});