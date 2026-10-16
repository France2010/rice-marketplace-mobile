import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

const REGIONS = [
  'Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya', 'Morogoro',
  'Tanga', 'Zanzibar', 'Kilimanjaro', 'Tabora', 'Kigoma', 'Iringa',
  'Mtwara', 'Pwani', 'Ruvuma', 'Singida', 'Shinyanga', 'Mara',
  'Kagera', 'Lindi', 'Rukwa', 'Katavi', 'Njombe', 'Simiyu',
  'Geita', 'Songwe', 'Manyara',
];

export default function CheckoutScreen({ navigation }) {
  const { t } = useTranslation();
  const { items, subtotal, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const [address, setAddress] = useState('');
  const [region, setRegion] = useState('Dar es Salaam');
  const [method, setMethod] = useState('COD');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const sub = subtotal();

  const placeOrder = async () => {
    if (!address) return Alert.alert('', 'Weka anwani ya kufikisha');
    if (method === 'MOBILE_MONEY' && !phone)
      return Alert.alert('', 'Weka namba ya simu');

    setLoading(true);
    try {
      const { data: orderRes } = await api.post('/orders', {
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity_kg: i.quantity_kg,
        })),
        delivery_region: region,
        delivery_address: address,
        payment_method: method,
      });
      const orderId = orderRes.id;
      clear();

      if (method === 'COD') {
        Alert.alert(
          '✔',
          'Oda imewekwa! Muuzaji atakuwekea gharama ya usafiri.',
          [{ text: 'OK', onPress: () => navigation.navigate('Orders') }]
        );
        return;
      }

      setWaiting(true);
      try {
        await api.post('/payments/initiate', { order_id: orderId, phone });
      } catch (err) {
        await api.post(`/orders/${orderId}/cancel`).catch(() => {});
        setWaiting(false);
        Alert.alert('Malipo hayakuanza',
          err.response?.data?.error || 'Jaribu tena');
        return;
      }

      Alert.alert('Malipo yameanzishwa',
        'Tafadhali kubali malipo kwenye simu yako.');

      let attempts = 0;
      const maxAttempts = 20;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const { data: st } = await api.get(`/payments/status/${orderId}`);
          if (st.status === 'PAID') {
            clearInterval(poll);
            setWaiting(false);
            Alert.alert('✔', 'Malipo yamekamilika!', [
              { text: 'OK', onPress: () => navigation.navigate('Orders') },
            ]);
          } else if (st.status === 'FAILED' || attempts >= maxAttempts) {
            clearInterval(poll);
            setWaiting(false);
            navigation.navigate('Orders');
          }
        } catch {}
      }, 3000);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  if (waiting) {
    return (
      <View style={styles.waiting}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.waitingText}>
          Tafadhali kubali malipo kwenye simu yako…
        </Text>
        <Text style={styles.waitingHint}>Usifunge app.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={styles.label}>Anwani ya kufikisha</Text>
      <TextInput
        style={styles.input}
        multiline
        value={address}
        onChangeText={setAddress}
        placeholder="Mtaa, Kijiji, Wilaya"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Mkoa</Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setShowRegionPicker(!showRegionPicker)}
      >
        <Text style={styles.pickerText}>{region}</Text>
        <Text>▼</Text>
      </TouchableOpacity>

      {showRegionPicker && (
        <ScrollView style={styles.regionList} nestedScrollEnabled>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={styles.regionItem}
              onPress={() => {
                setRegion(r);
                setShowRegionPicker(false);
              }}
            >
              <Text style={region === r ? styles.regionActive : {}}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.label}>Njia ya Malipo</Text>
      <TouchableOpacity
        style={[styles.method, method === 'COD' && styles.methodActive]}
        onPress={() => setMethod('COD')}
      >
        <Text style={method === 'COD' ? styles.methodActiveText : {}}>
          💵 Lipa Ukifika (Cash)
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.method, method === 'MOBILE_MONEY' && styles.methodActive]}
        onPress={() => setMethod('MOBILE_MONEY')}
      >
        <Text style={method === 'MOBILE_MONEY' ? styles.methodActiveText : {}}>
          📱 Malipo kwa Simu
        </Text>
      </TouchableOpacity>

      {method === 'MOBILE_MONEY' && (
        <>
          <Text style={styles.label}>Namba ya Simu</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            placeholder="07XXXXXXXX"
            placeholderTextColor="#888"
          />
        </>
      )}

      <View style={styles.summary}>
        <View style={styles.row}>
          <Text>Subtotal</Text>
          <Text>TZS {sub.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text>Usafirishaji</Text>
          <Text style={{ fontStyle: 'italic', color: '#888' }}>
            Atabainisha muuzaji
          </Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={{ fontWeight: '700' }}>Jumla (bila usafiri)</Text>
          <Text style={{ fontWeight: '700', color: '#2e7d32' }}>
            TZS {sub.toLocaleString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={placeOrder}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading
            ? '...'
            : method === 'COD'
            ? 'Weka Oda'
            : 'Lipa TZS ' + sub.toLocaleString()}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, color: '#000',
  },
  picker: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 14, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  pickerText: { fontSize: 15 },
  regionList: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 8,
    marginTop: 6, maxHeight: 200, backgroundColor: '#fafafa',
  },
  regionItem: {
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  regionActive: { color: '#2e7d32', fontWeight: '700' },
  method: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 14, marginBottom: 8, backgroundColor: '#fafafa',
  },
  methodActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  methodActiveText: { color: '#fff', fontWeight: '700' },
  summary: {
    marginTop: 24, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalRow: {
    borderTopWidth: 1, borderTopColor: '#eee',
    marginTop: 6, paddingTop: 12,
  },
  btn: {
    backgroundColor: '#2e7d32', padding: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 24, marginBottom: 30,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  waiting: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 24, backgroundColor: '#fff',
  },
  waitingText: {
    marginTop: 20, fontSize: 16, fontWeight: '600', textAlign: 'center',
  },
  waitingHint: { marginTop: 10, color: '#888', textAlign: 'center' },
});