import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <LanguageSwitcher />
      <Text style={styles.name}>{user?.full_name}</Text>
      <Text style={styles.phone}>{user?.phone}</Text>
      <Text style={styles.role}>{user?.role}</Text>
      <TouchableOpacity style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  name: { fontSize: 22, fontWeight: '700' },
  phone: { color: '#666', marginTop: 4 },
  role: { color: '#2e7d32', marginTop: 8, fontWeight: '600', textTransform: 'capitalize' },
  btn: { backgroundColor: '#c62828', padding: 14, borderRadius: 8, marginTop: 32, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});