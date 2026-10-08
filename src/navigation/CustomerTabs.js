import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import MarketplaceScreen from '../screens/customer/MarketplaceScreen';
import ProductDetailsScreen from '../screens/customer/ProductDetailsScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import NotificationsScreen from '../screens/customer/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ShopStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} options={{ title: t('products') }} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: t('products') }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: t('cart') }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: t('checkout') }} />
    </Stack.Navigator>
  );
}

export default function CustomerTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator>
      <Tab.Screen name="Shop" component={ShopStack} options={{ headerShown: false, title: t('products') }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: t('orders') }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: t('notifications') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile') }} />
    </Tab.Navigator>
  );
}