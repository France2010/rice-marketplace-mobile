import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function CheckoutScreen({ navigation }) {
  const { t } = useTranslation();
  const { items, subtotal, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const [deliveryFee, setDeliveryFee] = useState('0');
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState('COD');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const pollRef = useRef(null);
  const countdownRef = useRef(null);
  const orderIdRef = useRef(null);

  const sub = subtotal();
  const fee = parseFloat(deliveryFee) || 0;
  const total = sub + fee;

  // Clean up intervals if the user navigates away
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const stopAll = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    pollRef.current = null;
    countdownRef.current = null;
  };

  const cancelPendingOrder = async (reason = 'customer') => {
    const orderId = orderIdRef.current;
    if (!orderId) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      console.log(`Order ${orderId} cancelled (${reason})`);
    } catch (e) {
      console.warn('Cancel error:', e.response?.data || e.message);
    }
  };

  const placeOrderAndMaybePay = async () => {
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
        delivery_fee: fee,
        payment_method: method,
      });
      const orderId = orderRes.id;
      orderIdRef.current = orderId;

      if (method === 'COD') {
        clear();
        Alert.alert('✔', 'Oda imewekwa! Lipa ukifika.', [
          { text: 'OK', onPress: () => navigation.navigate('Orders') },
        ]);
        return;
      }

      // Mobile money: keep cart until payment succeeds
      setWaiting(true);
      try {
        await api.post('/payments/initiate', { order_id: orderId, phone });
      } catch (err) {
        // Payment initiation failed → cancel order
        await cancelPendingOrder('initiate failed');
        setWaiting(false);
        clear();
        Alert.alert(
          'Malipo hayakuanza',
          err.response?.data?.error || 'Jaribu tena',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Malipo yameanzishwa',
        'Tafadhali kubali malipo kwenye simu yako.',
        [{ text: 'Sawa' }]
      );

      // 3-minute window to approve
      const WINDOW_SECONDS = 180;
      setSecondsLeft(WINDOW_SECONDS);

      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
            return 0;
          }
          return s - 1;
        });
      }, 1000);

      let attempts = 0;
      const maxAttempts = 60; // 60 * 3s = 180s

      pollRef.current = setInterval(async () => {
        attempts++;
        try {
          const { data: st } = await api.get(`/payments/status/${orderId}`);

          if (st.status === 'PAID') {
            stopAll();
            setWaiting(false);
            clear();
            Alert.alert('✔', 'Malipo yamekamilika!', [
              { text: 'OK', onPress: () => navigation.navigate('Orders') },
            ]);
          } else if (st.status === 'FAILED') {
            stopAll();
            setWaiting(false);
            clear();
            Alert.alert('Malipo yameshindikana', 'Jaribu tena.', [
              { text: 'OK', onPress: () => navigation.navigate('Orders') },
            ]);
          } else if (attempts >= maxAttempts) {
            stopAll();
            await cancelPendingOrder('timeout');
            setWaiting(false);
            clear();
            Alert.alert(
              'Malipo hayakukamilika',
              'Muda wa malipo umepita. Oda yako imeondolewa.',
              [{ text: 'OK', onPress: () => navigation.navigate('Orders') }]
            );
          }
        } catch (err) {
          console.warn('Poll error:', err.message);
        }
      }, 3000);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const onCancelPayment = () => {
    Alert.alert(
      'Acha malipo?',
      'Oda yako itaondolewa. Unaweza kujaribu tena.',
      [
        { text: 'Endelea Kusubiri', style: 'cancel' },
        {
          text: 'Acha',
          style: 'destructive',
          onPress: async () => {
            stopAll();
            await cancelPendingOrder('manual cancel');
            setWaiting(false);
            clear();
            navigation.navigate('Orders');
          },
        },
      ]
    );
  };

  if (waiting) {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');
    return (
      <View style={styles.waitingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.waitingText}>Tafadhali kubali malipo kwenye simu yako…</Text>
        <Text style={styles.waitingHint}>Usifunge app. Inasubiri uthibitisho.</Text>
        <Text style={styles.countdown}>{mm}:{ss}</Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancelPayment}>
          <Text style={styles.cancelBtnText}>Acha Malipo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Anwani ya kufikisha</Text>
      <TextInput
        style={styles.input}
        multiline
        value={address}
        onChangeText={setAddress}
        placeholder="Mtaa, Kijiji, Wilaya"
      />

      <Text style={styles.label}>{t('delivery_fee')} (TZS)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={deliveryFee}
        onChangeText={setDeliveryFee}
      />

      <Text style={styles.label}>Njia ya Malipo</Text>
      <TouchableOpacity
        style={[styles.method, method === 'COD' && styles.methodActive]}
        onPress={() => setMethod('COD')}
      >
        <Text style={method === 'COD' ? styles.methodActiveText : {}}>💵 Lipa Ukifika (Cash)</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.method, method === 'MOBILE_MONEY' && styles.methodActive]}
        onPress={() => setMethod('MOBILE_MONEY')}
      >
        <Text style={method === 'MOBILE_MONEY' ? styles.methodActiveText : {}}>📱 Malipo kwa Simu</Text>
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
          />
        </>
      )}

      <View style={styles.summary}>
        <View style={styles.row}>
          <Text>{t('subtotal')}</Text>
          <Text>TZS {sub.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text>{t('delivery_fee')}</Text>
          <Text>TZS {fee.toLocaleString()}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={{ fontWeight: '700' }}>{t('total')}</Text>
          <Text style={{ fontWeight: '700', color: '#2e7d32' }}>TZS {total.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={placeOrderAndMaybePay}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? '...' : method === 'COD' ? 'Weka Oda' : 'Lipa TZS ' + total.toLocaleString()}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  method: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  methodActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  methodActiveText: { color: '#fff', fontWeight: '700' },
  summary: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 6, paddingTop: 12 },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  waitingText: { marginTop: 20, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  waitingHint: { marginTop: 10, color: '#888', textAlign: 'center' },
  countdown: { marginTop: 20, fontSize: 32, fontWeight: '700', color: '#2e7d32' },
  cancelBtn: {
    marginTop: 24, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 8, borderWidth: 1, borderColor: '#c62828',
  },
  cancelBtnText: { color: '#c62828', fontWeight: '600' },
});