import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import SellerDashboardScreen from '../screens/seller/SellerDashboardScreen';
import SellerProductsScreen from '../screens/seller/SellerProductsScreen';
import AddProductScreen from '../screens/seller/AddProductScreen';
import UpdateStockScreen from '../screens/seller/UpdateStockScreen';
import SellerOrdersScreen from '../screens/seller/SellerOrdersScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProductsStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SellerProducts"
        component={SellerProductsScreen}
        options={{ title: t('products') }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: t('add_product') }}
      />
      <Stack.Screen
        name="UpdateStock"
        component={UpdateStockScreen}
        options={{ title: 'Update Stock' }}
      />
    </Stack.Navigator>
  );
}

export default function SellerTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={SellerDashboardScreen} options={{ title: t('dashboard') }} />
      <Tab.Screen name="Products" component={ProductsStack} options={{ headerShown: false, title: t('products') }} />
      <Tab.Screen name="Orders" component={SellerOrdersScreen} options={{ title: t('orders') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile') }} />
    </Tab.Navigator>
  );
}