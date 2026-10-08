import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen({ navigation }) {
  const { t } = useTranslation();
  const { items, updateQty, removeItem, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 16 }}>{t('empty_cart')}</Text>
      </View>
    );
  }

  const total = subtotal();

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.product_id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>TZS {item.price_per_kg.toLocaleString()} /kg</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.product_id, Math.max(1, item.quantity_kg - 1))}
                >
                  <Text style={styles.qtyText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity_kg} kg</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.product_id, item.quantity_kg + 1)}
                >
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => removeItem(item.product_id)}>
                  <Text style={{ color: '#c62828' }}>Ondoa</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.lineTotal}>
              TZS {(item.price_per_kg * item.quantity_kg).toLocaleString()}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('subtotal')}</Text>
          <Text style={styles.totalValue}>TZS {total.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.btnText}>{t('checkout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { color: '#666', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: { borderWidth: 1, borderColor: '#ccc', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 18, fontWeight: '700' },
  qtyValue: { marginHorizontal: 12, fontWeight: '600' },
  lineTotal: { fontWeight: '700', color: '#2e7d32', alignSelf: 'flex-end' },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#2e7d32' },
  checkoutBtn: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});