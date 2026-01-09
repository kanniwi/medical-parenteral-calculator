import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { authAPI } from '@/utils/api';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading || isAuthenticated === null) return;

    const inAuthGroup = segments[0] === '(auth)';

    // If authenticated and in auth screens, redirect to tabs
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
    // Guest mode: Allow access to tabs without authentication
    // User can navigate to auth screens manually if they want to login
  }, [isAuthenticated, segments, isLoading, router]);

  const checkAuth = async () => {
    try {
      const authenticated = await authAPI.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (_error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
