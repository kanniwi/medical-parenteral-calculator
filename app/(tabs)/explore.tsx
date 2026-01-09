import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CalculationHistory } from '@/types/nutrition';
import { authAPI, calculationsAPI } from '@/utils/api';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'icon');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await calculationsAPI.getAll();
      console.log('📋 Loaded history data:', JSON.stringify(data, null, 2));
      setHistory(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        await authAPI.logout();
        router.replace('/(auth)/login');
      } else {
        console.error('Load history error:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить историю');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleClearHistory = () => {
    Alert.alert('Очистить историю', 'Вы уверены, что хотите удалить всю историю?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await calculationsAPI.clearAll();
            await loadHistory();
          } catch (error: any) {
            Alert.alert('Ошибка', 'Не удалось очистить историю');
            console.error('Clear history error:', error);
          }
        },
      },
    ]);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert('Удалить запись', 'Вы уверены, что хотите удалить эту запись?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await calculationsAPI.delete(id);
            await loadHistory();
          } catch (error: any) {
            Alert.alert('Ошибка', 'Не удалось удалить запись');
            console.error('Delete calculation error:', error);
          }
        },
      },
    ]);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Неверная дата';
    }
    
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            История расчетов
          </ThemedText>
          {history.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: tintColor }]}
              onPress={handleClearHistory}
              activeOpacity={0.7}>
              <ThemedText style={[styles.clearButtonText, { color: tintColor }]}>
                Очистить
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              История расчетов пуста{'\n'}Выполните расчет на главном экране
            </ThemedText>
          </ThemedView>
        ) : (
          history.map((item) => (
            <ThemedView
              key={item.id}
              style={[styles.historyItem, { borderColor: borderColor }]}>
              <ThemedView style={styles.historyHeader}>
                <ThemedText style={styles.historyDate}>{formatDate(item.timestamp)}</ThemedText>
                <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                  <ThemedText style={[styles.deleteButton, { color: '#FF3B30' }]}>
                    ✕
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>

              <ThemedView style={styles.historyContent}>
                <ThemedText style={styles.historyTotal}>
                  {item.result.total.calories} ккал
                </ThemedText>
                <ThemedText style={styles.historyVolume}>
                  Объем: {item.result.total.volume} мл
                </ThemedText>

                <ThemedView style={styles.historyDetails}>
                  <ThemedText style={styles.historyDetail}>
                    Глюкоза: {item.result.glucose.grams} г ({item.result.glucose.calories} ккал)
                  </ThemedText>
                  <ThemedText style={styles.historyDetail}>
                    Аминокислоты: {item.result.aminoAcids.grams} г (
                    {item.result.aminoAcids.calories} ккал)
                  </ThemedText>
                  <ThemedText style={styles.historyDetail}>
                    Липиды: {item.result.lipids.grams} г ({item.result.lipids.calories} ккал)
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.historyInput}>
                  <ThemedText style={styles.historyInputLabel}>Входные данные:</ThemedText>
                  <ThemedText style={styles.historyInputText}>
                    Глюкоза: {item.input.glucose.volume} мл, {item.input.glucose.concentration}%
                  </ThemedText>
                  <ThemedText style={styles.historyInputText}>
                    Аминокислоты: {item.input.aminoAcids.volume} мл,{' '}
                    {item.input.aminoAcids.concentration}%
                  </ThemedText>
                  <ThemedText style={styles.historyInputText}>
                    Липиды: {item.input.lipids.volume} мл, {item.input.lipids.concentration}%
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))
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
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 16,
  },
  historyItem: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  historyDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  deleteButton: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 4,
  },
  historyContent: {
    gap: 8,
  },
  historyTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  historyVolume: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  historyDetails: {
    gap: 4,
    marginBottom: 12,
  },
  historyDetail: {
    fontSize: 14,
  },
  historyInput: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  historyInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 4,
  },
  historyInputText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
