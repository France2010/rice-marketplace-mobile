import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Image, ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/client';

const GRADES = [
  { id: 1, label: 'Kawaida' },
  { id: 2, label: 'Kati' },
  { id: 3, label: 'Super' },
];

export default function AddProductScreen({ navigation }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    grade_id: 1,
    price_per_kg: '',
    quantity_kg: '',
    description: '',
    image_url: '',
    origin: '',
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async (fromCamera) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('', 'Ruhusa ya picha inahitajika');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          allowsEditing: true,
        });

    if (result.canceled) return;
    const asset = result.assets[0];
    uploadImage(asset.uri);
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm({ ...form, image_url: data.url });
    } catch (e) {
      Alert.alert('Upload failed', e.response?.data?.error || e.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    if (!form.name || !form.price_per_kg || !form.quantity_kg)
      return Alert.alert('', 'Jaza jina, bei na stock');
    setLoading(true);
    try {
      await api.post('/products', {
        ...form,
        price_per_kg: Number(form.price_per_kg),
        quantity_kg: Number(form.quantity_kg),
      });
      Alert.alert('✔', 'Bidhaa imeongezwa');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Picha ya Mchele</Text>
      <View style={styles.imageBox}>
        {form.image_url ? (
          <Image source={{ uri: form.image_url }} style={styles.preview} />
        ) : (
          <Text style={{ color: '#999' }}>Hakuna picha bado</Text>
        )}
      </View>
      {uploading && <ActivityIndicator style={{ marginTop: 8 }} color="#2e7d32" />}
      <View style={styles.photoButtons}>
        <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)} disabled={uploading}>
          <Text style={styles.photoBtnText}>📷 Piga Picha</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(false)} disabled={uploading}>
          <Text style={styles.photoBtnText}>🖼️ Chagua</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>{t('product_name')}</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />

      <Text style={styles.label}>{t('grade')}</Text>
      <View style={styles.gradeRow}>
        {GRADES.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.grade, form.grade_id === g.id && styles.gradeActive]}
            onPress={() => setForm({ ...form, grade_id: g.id })}
          >
            <Text style={form.grade_id === g.id ? { color: '#fff', fontWeight: '600' } : {}}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('price_per_kg')}</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={form.price_per_kg} onChangeText={(v) => setForm({ ...form, price_per_kg: v })} />

      <Text style={styles.label}>{t('stock')} (kg)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={form.quantity_kg} onChangeText={(v) => setForm({ ...form, quantity_kg: v })} />

      <Text style={styles.label}>{t('description')}</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />

      <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading || uploading}>
        <Text style={styles.btnText}>{loading ? '...' : t('save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  imageBox: {
    height: 180, borderRadius: 10, borderWidth: 1, borderColor: '#ddd',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  preview: { width: '100%', height: '100%' },
  photoButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  photoBtn: {
    flex: 1, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8,
    alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
  },
  photoBtnText: { fontWeight: '600', color: '#333' },
  gradeRow: { flexDirection: 'row', gap: 8 },
  grade: { flex: 1, borderWidth: 1, borderColor: '#2e7d32', padding: 10, borderRadius: 8, alignItems: 'center' },
  gradeActive: { backgroundColor: '#2e7d32' },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 32 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});