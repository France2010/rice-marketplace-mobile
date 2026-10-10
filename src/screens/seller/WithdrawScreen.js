import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import api from '../../api/client';

const SERVICES = [
  { code: 'VODACOM', label: 'M-Pesa' },
  { code: 'TIGO', label: 'Mixx by Yas' },
  { code: 'AIRTEL', label: 'Airtel Money' },
  { code: 'HALOTEL', label: 'HaloPesa' },
];

export default function WithdrawScreen() {
  const [bal, setBal] = useState({ earned: 0, withdrawn: 0, available: 0 });
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('VODACOM');
  const [saving, setSaving] = useState(false);

  const loadBal = () => api.get('/withdrawals/balance').then((r) => setBal(r.data)).catch(() => {});

  useEffect(() => { loadBal(); }, []);

  const onWithdraw = async () => {
    if (!amount || !phone) return Alert.alert('', 'Jaza kiasi na namba');
    setSaving(true);
    try {
      await api.post('/withdrawals/request', {
        amount: Number(amount),
        phone,
        serviceCode: service,
      });
      Alert.alert('✔', 'Ombi la kutoa limetumwa');
      setAmount('');
      loadBal();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.balCard}>
        <Text style={styles.balLabel}>Salio Linalopatikana</Text>
        <Text style={styles.bal}>TZS {Number(bal.available).toLocaleString()}</Text>
        <Text style={styles.balSub}>Jumla: TZS {Number(bal.earned).toLocaleString()} • Umetoa: TZS {Number(bal.withdrawn).toLocaleString()}</Text>
      </View>

      <Text style={styles.label}>Kiasi (TZS)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Mf. 20000"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Namba ya Simu</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        placeholder="07XXXXXXXX"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Mtandao</Text>
      <View style={styles.chipRow}>
        {SERVICES.map((s) => (
          <TouchableOpacity
            key={s.code}
            style={[styles.chip, service === s.code && styles.chipActive]}
            onPress={() => setService(s.code)}
          >
            <Text style={service === s.code ? styles.chipActiveText : {}}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={onWithdraw} disabled={saving}>
        <Text style={styles.btnText}>{saving ? '...' : 'Toa Pesa'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  balCard: { backgroundColor: '#e8f5e9', padding: 20, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  balLabel: { color: '#555', fontSize: 13 },
  bal: { fontSize: 28, fontWeight: '700', color: '#2e7d32', marginTop: 6 },
  balSub: { color: '#777', fontSize: 12, marginTop: 6 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, color: '#000' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
  chipActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  chipActiveText: { color: '#fff', fontWeight: '700' },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});