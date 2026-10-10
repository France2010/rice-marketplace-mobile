import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import api from '../../api/client';

export default function ReviewScreen({ route, navigation }) {
  const { orderId, productId, productName } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      await api.post('/reviews', {
        product_id: productId,
        order_id: orderId,
        rating,
        comment,
      });
      Alert.alert('✔', 'Asante kwa maoni yako!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.name}>{productName}</Text>
      <Text style={styles.label}>Kiwango chako</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity key={s} onPress={() => setRating(s)}>
            <Text style={[styles.star, { color: s <= rating ? '#fbc02d' : '#ccc' }]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingText}>{rating} / 5</Text>

      <Text style={styles.label}>Maoni (optional)</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        placeholder="Andika maoni yako..."
        placeholderTextColor="#888"
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity style={styles.btn} onPress={onSave} disabled={saving}>
        <Text style={styles.btnText}>{saving ? '...' : 'Tuma Maoni'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  label: { fontWeight: '600', marginTop: 16, marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 6 },
  star: { fontSize: 44 },
  ratingText: { color: '#666', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, color: '#000' },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});