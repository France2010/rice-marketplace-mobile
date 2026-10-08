import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';

export default function UpdateStockScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { product } = route.params;

  const [add, setAdd] = useState('');
  const [replace, setReplace] = useState(String(product.quantity_kg ?? 0));
  const [loading, setLoading] = useState(false);

  // Option 1: Add to existing stock
  const onAdd = async () => {
    const amount = parseFloat(add);
    if (!amount || amount <= 0) return Alert.alert('', 'Weka kiasi sahihi');

    setLoading(true);
    try {
      const newQty = Number(product.quantity_kg || 0) + amount;
      await api.put(`/products/${product.id}/stock`, { quantity_kg: newQty });
      Alert.alert('✔', `Stock imeongezwa. Jumla: ${newQty} kg`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  // Option 2: Replace total stock
  const onReplace = async () => {
    const amount = parseFloat(replace);
    if (isNaN(amount) || amount < 0) return Alert.alert('', 'Weka kiasi sahihi');

    setLoading(true);
    try {
      await api.put(`/products/${product.id}/stock`, { quantity_kg: amount });
      Alert.alert('✔', `Stock imewekwa: ${amount} kg`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.current}>
          Stock ya sasa: <Text style={styles.currentBold}>{product.quantity_kg ?? 0} kg</Text>
        </Text>
      </View>

      {/* OPTION 1 — Add more stock */}
      <View style={styles.box}>
        <Text style={styles.boxTitle}>➕ Ongeza Stock</Text>
        <Text style={styles.boxHint}>
          Ukipata mchele mpya, ongeza kwenye stock iliyopo.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Kiasi (kg)"
          value={add}
          onChangeText={setAdd}
        />
        <TouchableOpacity style={styles.btn} onPress={onAdd} disabled={loading}>
          <Text style={styles.btnText}>
            {loading ? '...' : `Ongeza ${add || 0} kg`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* OPTION 2 — Replace total stock */}
      <View style={styles.box}>
        <Text style={styles.boxTitle}>✏️ Weka Stock Mpya</Text>
        <Text style={styles.boxHint}>
          Tumia hii kama ulifanya stock take au unataka kubadilisha jumla.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Jumla mpya (kg)"
          value={replace}
          onChangeText={setReplace}
        />
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={onReplace}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? '...' : `Weka ${replace || 0} kg`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 12, backgroundColor: '#f1f8e9', borderRadius: 10, marginBottom: 16 },
  productName: { fontSize: 18, fontWeight: '700' },
  current: { marginTop: 6, color: '#555' },
  currentBold: { color: '#2e7d32', fontWeight: '700', fontSize: 16 },
  box: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 10,
    padding: 14, marginBottom: 16, backgroundColor: '#fafafa',
  },
  boxTitle: { fontWeight: '700', fontSize: 16, marginBottom: 6 },
  boxHint: { color: '#777', marginBottom: 12, fontSize: 13 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, backgroundColor: '#fff', marginBottom: 10,
  },
  btn: {
    backgroundColor: '#2e7d32', padding: 14, borderRadius: 8,
    alignItems: 'center',
  },
  btnSecondary: { backgroundColor: '#0d47a1' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});