import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';
import ProductCard from '../../components/ProductCard';

export default function FavoritesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => api.get('/favorites/mine').then((r) => setItems(r.data)).catch(() => {});

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

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => navigation.navigate('Shop', { screen: 'ProductDetails', params: { product: item } })} />
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Hakuna vipendwa bado</Text>}
      />
    </View>
  );
}