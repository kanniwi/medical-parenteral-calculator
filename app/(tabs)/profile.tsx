import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { authAPI } from '@/utils/api';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedUser = await authAPI.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setIsGuest(false);
      }
      // Также можно загрузить свежие данные с сервера
      try {
        const response = await authAPI.getProfile();
        setUser(response.user);
        setIsGuest(false);
      } catch (_error) {
        // Если не удалось загрузить с сервера, пользователь в гостевом режиме
        setIsGuest(true);
      }
    } catch (_error) {
      setIsGuest(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const handleLogout = async () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await authAPI.logout();
          setUser(null);
          setIsGuest(true);
          // Stay on profile screen in guest mode instead of redirecting
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.container}>
          <ThemedText>Загрузка...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Профиль
            </ThemedText>
          </ThemedView>

          {isGuest ? (
            <>
              <ThemedView style={styles.guestCard}>
                <ThemedText style={styles.guestTitle}>Гостевой режим</ThemedText>
                <ThemedText style={styles.guestText}>
                  Вы используете приложение без регистрации. Все расчеты работают, но история не сохраняется.
                </ThemedText>
                <ThemedText style={[styles.guestText, { marginTop: 12 }]}>
                  Войдите или зарегистрируйтесь, чтобы сохранять историю расчетов и синхронизировать их между устройствами.
                </ThemedText>
              </ThemedView>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: tintColor }]}
                onPress={handleLogin}>
                <ThemedText style={styles.primaryButtonText} lightColor="#FFFFFF" darkColor="#000000">
                  Войти
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: tintColor }]}
                onPress={handleRegister}>
                <ThemedText style={[styles.secondaryButtonText, { color: tintColor }]}>
                  Зарегистрироваться
                </ThemedText>
              </TouchableOpacity>

              <ThemedView style={styles.infoCard}>
                <ThemedText style={styles.infoText}>
                  💡 В гостевом режиме вы можете использовать калькулятор без ограничений, но расчеты не будут сохранены.
                </ThemedText>
              </ThemedView>
            </>
          ) : (
            <>
              <ThemedView style={styles.profileCard}>
                <ThemedView style={styles.profileSection}>
                  <ThemedText style={styles.label}>Email</ThemedText>
                  <ThemedText style={styles.value}>{user?.email}</ThemedText>
                </ThemedView>

                {user?.name && (
                  <ThemedView style={styles.profileSection}>
                    <ThemedText style={styles.label}>Имя</ThemedText>
                    <ThemedText style={styles.value}>{user.name}</ThemedText>
                  </ThemedView>
                )}

                {user?.created_at && (
                  <ThemedView style={styles.profileSection}>
                    <ThemedText style={styles.label}>Дата регистрации</ThemedText>
                    <ThemedText style={styles.value}>
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>

              <TouchableOpacity
                style={[styles.logoutButton, { borderColor: '#FF3B30' }]}
                onPress={handleLogout}>
                <ThemedText style={styles.logoutButtonText}>
                  Выйти
                </ThemedText>
              </TouchableOpacity>

              <ThemedView style={styles.infoCard}>
                <ThemedText style={styles.infoText}>
                  ✅ Все ваши расчеты сохраняются в базе данных и доступны на всех ваших устройствах.
                </ThemedText>
              </ThemedView>
            </>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  guestCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  guestText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  primaryButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  profileCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 20,
    marginBottom: 20,
  },
  profileSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 6,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    backgroundColor: 'rgba(10, 126, 164, 0.05)',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
