import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ full_name: '', phone: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!form.full_name || !form.phone || !form.password)
      return Alert.alert('', 'Jaza sehemu zote');
    setLoading(true);
    try {
      await register(form);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('register')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('full_name')}
        value={form.full_name}
        onChangeText={(v) => setForm({ ...form, full_name: v })}
      />
      <TextInput
        style={styles.input}
        placeholder={t('phone')}
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(v) => setForm({ ...form, phone: v })}
      />
      <TextInput
        style={styles.input}
        placeholder={t('password')}
        secureTextEntry
        value={form.password}
        onChangeText={(v) => setForm({ ...form, password: v })}
      />
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleBtn, form.role === 'customer' && styles.roleActive]}
          onPress={() => setForm({ ...form, role: 'customer' })}
        >
          <Text style={form.role === 'customer' ? styles.roleActiveText : {}}>{t('role_customer')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleBtn, form.role === 'seller' && styles.roleActive]}
          onPress={() => setForm({ ...form, role: 'seller' })}
        >
          <Text style={form.role === 'seller' ? styles.roleActiveText : {}}>{t('role_seller')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.btn} onPress={onRegister} disabled={loading}>
        <Text style={styles.btnText}>{loading ? '...' : t('register')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#2e7d32' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, marginBottom: 12 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  roleBtn: { flex: 1, borderWidth: 1, borderColor: '#2e7d32', padding: 12, borderRadius: 8, alignItems: 'center' },
  roleActive: { backgroundColor: '#2e7d32' },
  roleActiveText: { color: '#fff', fontWeight: '600' },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});