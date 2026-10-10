import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import api, { fullImageUrl } from '../../api/client';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200';

export default function EditOrderScreen({ route, navigation }) {
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then((r) => {
        setOrder(r.data);
        setItems(r.data.items.map((it) => ({
          product_id: it.product_id,
          name: it.name,
          image_url: it.image_url,
          unit_price: Number(it.unit_price),
          quantity_kg: Number(it.quantity_kg),
        })));
      })
      .catch((e) => Alert.alert('Error', e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const updateQty = (pid, qty) => {
    setItems((prev) =>
      prev.map((it) =>
        it.product_id === pid ? { ...it, quantity_kg: Math.max(1, qty) } : it
      )
    );
  };

  const removeItem = (pid) => {
    setItems((prev) => prev.filter((it) => it.product_id !== pid));
  };

  const newSubtotal = items.reduce(
    (s, it) => s + it.unit_price * it.quantity_kg, 0
  );
  const deliveryFee = Number(order?.delivery_fee || 0);
  const newTotal = newSubtotal + deliveryFee;

  const onSave = async () => {
    if (!items.length) return Alert.alert('', 'Oda haiwezi kuwa tupu');
    setSaving(true);
    try {
      await api.put(`/orders/${orderId}`, {
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity_kg: i.quantity_kg,
        })),
      });
      Alert.alert('✔', 'Oda imebadilishwa', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.product_id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image
              source={{ uri: fullImageUrl(item.image_url) || DEFAULT_IMG }}
              style={styles.thumb}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>TZS {item.unit_price.toLocaleString()} /kg</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.product_id, item.quantity_kg - 1)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyVal}>{item.quantity_kg} kg</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.product_id, item.quantity_kg + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginLeft: 12 }}
                  onPress={() => removeItem(item.product_id)}
                >
                  <Text style={{ color: '#c62828' }}>Ondoa</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.lineTotal}>
              TZS {(item.unit_price * item.quantity_kg).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Hakuna bidhaa</Text>}
      />

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>TZS {newSubtotal.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Delivery</Text>
          <Text>TZS {deliveryFee.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={{ fontWeight: '700' }}>Jumla</Text>
          <Text style={{ fontWeight: '700', color: '#2e7d32' }}>
            TZS {newTotal.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={onSave} disabled={saving}>
          <Text style={styles.btnText}>{saving ? '...' : 'Hifadhi Mabadiliko'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 12,
    borderRadius: 10, marginBottom: 10, alignItems: 'center',
  },
  thumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  name: { fontWeight: '600', fontSize: 15 },
  price: { color: '#666', marginTop: 2, fontSize: 13 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: '#ccc',
  },
  qtyBtnText: { fontSize: 18, fontWeight: '700' },
  qtyVal: { marginHorizontal: 12, fontWeight: '600' },
  lineTotal: { fontWeight: '700', color: '#2e7d32' },
  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 6, paddingTop: 10 },
  btn: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 14 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});