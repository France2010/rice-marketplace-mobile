import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function SellerDashboardScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products/mine').then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const totalStock = products.reduce((s, p) => s + Number(p.quantity_kg || 0), 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.welcome}>Karibu, {user?.full_name}</Text>
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{products.length}</Text>
          <Text style={styles.cardLabel}>{t('products')}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{totalStock} kg</Text>
          <Text style={styles.cardLabel}>{t('stock')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  welcome: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
  cardNum: { fontSize: 24, fontWeight: '700', color: '#2e7d32' },
  cardLabel: { color: '#666', marginTop: 6 },
});