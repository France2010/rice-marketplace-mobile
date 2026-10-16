import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView,
} from 'react-native';
import api from '../../api/client';

const QUICK_FEES = [2000, 3000, 5000, 7000, 10000];

export default function SetDeliveryFeeScreen({ route, navigation }) {
  const { order } = route.params;
  const [fee, setFee] = useState(String(order.delivery_fee || ''));
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const f = Number(fee);
    if (isNaN(f) || f < 0) return Alert.alert('', 'Weka gharama sahihi');
    setSaving(true);
    try {
      await api.put(`/orders/${order.id}/delivery-fee`, { delivery_fee: f });
      Alert.alert('✔', `Gharama imewekwa: TZS ${f.toLocaleString()}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 20 }}
    >
      <View style={styles.info}>
        <Text style={styles.orderNum}>#{order.order_number}</Text>
        <Text style={styles.meta}>
          Subtotal: TZS {Number(order.subtotal).toLocaleString()}
        </Text>
        {!!order.delivery_region && (
          <Text style={styles.meta}>📍 Mkoa: {order.delivery_region}</Text>
        )}
        {!!order.delivery_address && (
          <Text style={styles.meta}>🏠 {order.delivery_address}</Text>
        )}
      </View>

      <Text style={styles.label}>Gharama ya Usafiri (TZS)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={fee}
        onChangeText={setFee}
        placeholder="Mf. 5000"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Chaguo la haraka</Text>
      <View style={styles.chipRow}>
        {QUICK_FEES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, Number(fee) === f && styles.chipActive]}
            onPress={() => setFee(String(f))}
          >
            <Text style={Number(fee) === f ? styles.chipActiveText : {}}>
              TZS {f.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Jumla Mpya</Text>
        <Text style={styles.totalValue}>
          TZS {(Number(order.subtotal) + Number(fee || 0)).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={styles.btnText}>
          {saving ? '...' : 'Hifadhi Gharama'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  info: {
    backgroundColor: '#f1f8e9', padding: 14, borderRadius: 10, marginBottom: 20,
  },
  orderNum: { fontWeight: '700', fontSize: 16 },
  meta: { color: '#555', marginTop: 4 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 14, color: '#000', fontSize: 16,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#ccc',
  },
  chipActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  chipActiveText: { color: '#fff', fontWeight: '700' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 24, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#2e7d32' },
  btn: {
    backgroundColor: '#2e7d32', padding: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 24,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});