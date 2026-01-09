import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authAPI } from '@/utils/api';
import { ThemedText } from '@/components/themed-text';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Калькулятор',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="number.square.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'История',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                await authAPI.logout();
                router.replace('/(auth)/login');
              }}>
              <ThemedText style={styles.logoutText}>Выйти</ThemedText>
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});
