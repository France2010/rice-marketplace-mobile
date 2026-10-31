import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';

export default function UpdateStockScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { product } = route.params;

  const [add, setAdd] = useState('');
  const [replace, setReplace] = useState(String(product.quantity_kg ?? 0));
  const [cost, setCost] = useState(String(product.cost_per_kg || ''));
  const [loading, setLoading] = useState(false);

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

  const onReplace = async () => {
    const amount = parseFloat(replace);
    if (isNaN(amount) || amount < 0) return Alert.alert('', 'Weka kiasi sahihi');

    setLoading(true);
    try {
      await api.put(`/products/${product.id}/stock`, { quantity_kg: amount });
      
      await api.put(`/products/${product.id}/price`, { 
        price_per_kg: product.price_per_kg, 
        cost_per_kg: Number(cost) || 0 
      });

      Alert.alert('✔', `Stock na Gharama vimehifadhiwa`, [
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
          placeholderTextColor="#888"
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
          placeholderTextColor="#888"
          value={replace}
          onChangeText={setReplace}
        />

        <Text style={{ fontWeight: '600', marginTop: 8, marginBottom: 4 }}>Gharama ya Kununua (TZS/kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Mf. 2000"
          placeholderTextColor="#888"
          value={cost}
          onChangeText={setCost}
        />
        <Text style={{ fontSize: 12, color: '#888', marginTop: 4, marginBottom: 8 }}>
          Hii itasaidia kuhesabu faida yako (Profit).
        </Text>

        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={onReplace}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? '...' : `Hifadhi`}
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
    padding: 12, backgroundColor: '#fff', marginBottom: 10, color: '#000',
  },
  btn: {
    backgroundColor: '#2e7d32', padding: 14, borderRadius: 8,
    alignItems: 'center',
  },
  btnSecondary: { backgroundColor: '#0d47a1' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});