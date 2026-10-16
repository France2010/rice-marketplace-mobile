import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const REGIONS = [
  'Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya', 'Morogoro',
  'Tanga', 'Zanzibar', 'Kilimanjaro', 'Tabora', 'Kigoma', 'Iringa',
  'Mtwara', 'Pwani', 'Ruvuma', 'Singida', 'Shinyanga', 'Mara',
  'Kagera', 'Lindi', 'Rukwa', 'Katavi', 'Njombe', 'Simiyu',
  'Geita', 'Songwe', 'Manyara',
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/profile/me')
      .then((r) => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  const isSeller = profile.role === 'seller';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.full_name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile.full_name}</Text>
        <Text style={styles.phone}>📞 {profile.phone}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{isSeller ? '🏪 Muuzaji' : '🛒 Mteja'}</Text>
        </View>
        {isSeller && profile.seller_profile?.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✅ Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Taarifa Zangu</Text>
        <Row label="Jina" value={profile.full_name} />
        <Row label="Namba ya simu" value={profile.phone} />
        <Row label="Barua pepe" value={profile.email || '—'} />
        {isSeller && (
          <Row label="Biashara" value={profile.seller_profile?.business_name || '—'} />
        )}
        <Row
          label="Mkoa"
          value={
            isSeller
              ? profile.seller_profile?.region || '—'
              : profile.customer_profile?.region || '—'
          }
        />
        {!isSeller && (
          <Row label="Anwani" value={profile.customer_profile?.default_address || '—'} />
        )}
      </View>

      <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
        <Text style={styles.editBtnText}>✏️ Badilisha Taarifa</Text>
      </TouchableOpacity>

      <View style={styles.langBox}>
        <Text style={styles.langLabel}>Lugha / Language</Text>
        <LanguageSwitcher />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {editing && (
        <EditProfileModal
          profile={profile}
          isSeller={isSeller}
          onClose={() => { setEditing(false); load(); }}
        />
      )}
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function EditProfileModal({ profile, isSeller, onClose }) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    email: profile.email || '',
    business_name: profile.seller_profile?.business_name || '',
    region: isSeller
      ? (profile.seller_profile?.region || '')
      : (profile.customer_profile?.region || ''),
    default_address: profile.customer_profile?.default_address || '',
    current_password: '',
    new_password: '',
  });
  const [saving, setSaving] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const save = async () => {
    if (!form.full_name) return Alert.alert('', 'Jina linahitajika');
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        region: form.region,
      };
      if (isSeller) payload.business_name = form.business_name;
      else payload.default_address = form.default_address;

      if (form.new_password) {
        payload.current_password = form.current_password;
        payload.new_password = form.new_password;
      }

      await api.put('/profile/me', payload);
      Alert.alert('✔', 'Taarifa zimehifadhiwa');
      onClose();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={true} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <ScrollView>
            <Text style={styles.modalTitle}>Badilisha Taarifa</Text>

            <Text style={styles.label}>Jina Kamili</Text>
            <TextInput
              style={styles.input}
              value={form.full_name}
              onChangeText={(v) => setForm({ ...form, full_name: v })}
              placeholderTextColor="#888"
            />

            <Text style={styles.label}>Barua Pepe</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              placeholderTextColor="#888"
            />

            {isSeller && (
              <>
                <Text style={styles.label}>Jina la Biashara</Text>
                <TextInput
                  style={styles.input}
                  value={form.business_name}
                  onChangeText={(v) => setForm({ ...form, business_name: v })}
                  placeholderTextColor="#888"
                />
              </>
            )}

            {!isSeller && (
              <>
                <Text style={styles.label}>Anwani ya Kawaida</Text>
                <TextInput
                  style={[styles.input, { height: 70 }]}
                  multiline
                  value={form.default_address}
                  onChangeText={(v) => setForm({ ...form, default_address: v })}
                  placeholderTextColor="#888"
                />
              </>
            )}

            <Text style={styles.label}>Mkoa</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowRegionPicker(!showRegionPicker)}
            >
              <Text>{form.region || 'Chagua mkoa'}</Text>
              <Text>▼</Text>
            </TouchableOpacity>

            {showRegionPicker && (
              <ScrollView style={styles.regionList} nestedScrollEnabled>
                {REGIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={styles.regionItem}
                    onPress={() => {
                      setForm({ ...form, region: r });
                      setShowRegionPicker(false);
                    }}
                  >
                    <Text style={form.region === r ? styles.regionActive : {}}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.sectionHeader}>Badilisha Neno la Siri (optional)</Text>

            <Text style={styles.label}>Neno la Siri la Sasa</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={form.current_password}
              onChangeText={(v) => setForm({ ...form, current_password: v })}
              placeholderTextColor="#888"
            />

            <Text style={styles.label}>Neno la Siri Jipya</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={form.new_password}
              onChangeText={(v) => setForm({ ...form, new_password: v })}
              placeholderTextColor="#888"
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Ghairi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={save}
                disabled={saving}
              >
                <Text style={styles.saveText}>{saving ? '...' : 'Hifadhi'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#2e7d32', padding: 30, alignItems: 'center' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#2e7d32' },
  name: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 12 },
  phone: { color: '#c8e6c9', marginTop: 4 },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, marginTop: 10,
  },
  roleText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  verifiedBadge: {
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, marginTop: 8,
  },
  verifiedText: { color: '#2e7d32', fontWeight: '700', fontSize: 12 },
  card: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12 },
  cardTitle: { fontWeight: '700', fontSize: 16, marginBottom: 12 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  rowLabel: { color: '#666' },
  rowValue: { fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  editBtn: {
    backgroundColor: '#2e7d32', marginHorizontal: 16, marginBottom: 16,
    padding: 14, borderRadius: 8, alignItems: 'center',
  },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  langBox: { backgroundColor: '#fff', marginHorizontal: 16, padding: 16, borderRadius: 12 },
  langLabel: { fontWeight: '700', marginBottom: 8 },
  logoutBtn: {
    backgroundColor: '#ffebee', marginHorizontal: 16, marginTop: 16,
    padding: 14, borderRadius: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#c62828',
  },
  logoutText: { color: '#c62828', fontWeight: '700', fontSize: 15 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '90%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
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
  regionList: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 8,
    marginTop: 6, maxHeight: 200, backgroundColor: '#fafafa',
  },
  regionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  regionActive: { color: '#2e7d32', fontWeight: '700' },
  sectionHeader: {
    fontWeight: '700', fontSize: 15, marginTop: 24,
    marginBottom: 8, color: '#666',
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#eee' },
  saveBtn: { backgroundColor: '#2e7d32' },
  cancelText: { fontWeight: '700' },
  saveText: { color: '#fff', fontWeight: '700' },
});