import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authAPI } from '@/utils/api';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await authAPI.login({ email, password });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Ошибка входа',
        error.response?.data?.error || 'Не удалось войти. Проверьте данные.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Вход
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Войдите в свой аккаунт для доступа к расчетам
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.form}>
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor={borderColor}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Пароль</ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Введите пароль"
                placeholderTextColor={borderColor}
                secureTextEntry
                autoCapitalize="none"
              />
            </ThemedView>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: tintColor }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}>
              <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                {loading ? 'Вход...' : 'Войти'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/(auth)/register')}>
              <ThemedText style={styles.registerText}>
                Нет аккаунта? <ThemedText style={{ color: tintColor }}>Зарегистрироваться</ThemedText>
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    minHeight: 48,
  },
  loginButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
