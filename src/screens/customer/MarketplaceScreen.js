import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import ProductCard from '../../components/ProductCard';
import { useCartStore } from '../../store/cartStore';

export default function MarketplaceScreen({ navigation }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const cartCount = useCartStore((s) => s.items.length);

  const load = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (e) {
      console.warn('Load error:', e.message);
    }
  };

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.topBar}>
        <TextInput
          style={styles.search}
          placeholder={t('search')}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
          <Text style={styles.cartText}>🛒 {cartCount}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
          />
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Hakuna bidhaa</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#2e7d32' },
  search: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  cartBtn: { marginLeft: 10, padding: 10 },
  cartText: { color: '#fff', fontWeight: '600' },
});