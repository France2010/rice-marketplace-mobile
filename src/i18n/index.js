import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import sw from './sw.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, sw: { translation: sw } },
  lng: 'sw',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

AsyncStorage.getItem('language').then((lang) => {
  if (lang) i18n.changeLanguage(lang);
});

export const switchLanguage = async (lang) => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem('language', lang);
};

export default i18n;