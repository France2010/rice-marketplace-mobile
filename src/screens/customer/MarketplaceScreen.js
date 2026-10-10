import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet, RefreshControl,
  TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import ProductCard from '../../components/ProductCard';
import { useCartStore } from '../../store/cartStore';

const GRADES = [
  { id: null, label: 'Zote' },
  { id: 1, label: 'Kawaida' },
  { id: 2, label: 'Kati' },
  { id: 3, label: 'Super' },
];

export default function MarketplaceScreen({ navigation }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [gradeId, setGradeId] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const cartCount = useCartStore((s) => s.items.length);

  const load = async () => {
    try {
      const params = {};
      if (query) params.q = query;
      if (gradeId) params.grade = gradeId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy !== 'newest') params.sortBy = sortBy;
      const { data } = await api.get('/products', { params });
      setProducts(data);
    } catch (e) {}
  };

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, query, gradeId, minPrice, maxPrice, sortBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const resetFilters = () => {
    setGradeId(null);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  const activeCount = [gradeId, minPrice, maxPrice, sortBy !== 'newest' ? 1 : null].filter(Boolean).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.topBar}>
        <TextInput
          style={styles.search}
          placeholder={t('search')}
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={load}
        />
        <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.filterBtn}>
          <Text style={styles.filterText}>⚙️ {activeCount > 0 ? `(${activeCount})` : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
          <Text style={styles.cartText}>🛒 {cartCount}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => navigation.navigate('ProductDetails', { product: item })} />
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Hakuna bidhaa</Text>}
      />

      <Modal visible={showFilter} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>Filter Bidhaa</Text>

              <Text style={styles.filterLabel}>Kiwango</Text>
              <View style={styles.chipRow}>
                {GRADES.map((g) => (
                  <TouchableOpacity
                    key={String(g.id)}
                    style={[styles.chip, gradeId === g.id && styles.chipActive]}
                    onPress={() => setGradeId(g.id)}
                  >
                    <Text style={gradeId === g.id ? styles.chipActiveText : {}}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Bei (TZS / kg)</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Kutoka" placeholderTextColor="#888" keyboardType="numeric" value={minPrice} onChangeText={setMinPrice} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Hadi" placeholderTextColor="#888" keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice} />
              </View>

              <Text style={styles.filterLabel}>Panga</Text>
              <View style={styles.chipRow}>
                {[
                  { key: 'newest', label: 'Mpya' },
                  { key: 'price_asc', label: 'Bei ↑' },
                  { key: 'price_desc', label: 'Bei ↓' },
                  { key: 'rating', label: '⭐ Rating' },
                ].map((s) => (
                  <TouchableOpacity key={s.key} style={[styles.chip, sortBy === s.key && styles.chipActive]} onPress={() => setSortBy(s.key)}>
                    <Text style={sortBy === s.key ? styles.chipActiveText : {}}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalBtns}>
                <TouchableOpacity style={[styles.modalBtn, styles.resetBtn]} onPress={resetFilters}>
                  <Text style={styles.resetText}>Safisha</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.applyBtn]} onPress={() => setShowFilter(false)}>
                  <Text style={styles.applyText}>Tumia</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#2e7d32' },
  search: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, color: '#000' },
  filterBtn: { marginLeft: 8, padding: 10 },
  filterText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cartBtn: { marginLeft: 4, padding: 10 },
  cartText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  filterLabel: { fontWeight: '600', marginTop: 16, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
  chipActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  chipActiveText: { color: '#fff', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, color: '#000' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  resetBtn: { backgroundColor: '#eee' },
  applyBtn: { backgroundColor: '#2e7d32' },
  resetText: { fontWeight: '700' },
  applyText: { color: '#fff', fontWeight: '700' },
});