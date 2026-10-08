import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { switchLanguage } from '../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, i18n.language === 'sw' && styles.active]}
        onPress={() => switchLanguage('sw')}
      >
        <Text style={i18n.language === 'sw' ? styles.activeText : {}}>Kiswahili</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, i18n.language === 'en' && styles.active]}
        onPress={() => switchLanguage('en')}
      >
        <Text style={i18n.language === 'en' ? styles.activeText : {}}>English</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  btn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#2e7d32' },
  active: { backgroundColor: '#2e7d32' },
  activeText: { color: '#fff' },
});