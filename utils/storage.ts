import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalculationHistory } from '@/types/nutrition';

const STORAGE_KEY = '@parenteral_nutrition_history';

export async function saveCalculation(calculation: CalculationHistory): Promise<void> {
  try {
    const history = await getHistory();
    history.unshift(calculation); // Добавляем в начало
    // Ограничиваем историю 50 записями
    const limitedHistory = history.slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Ошибка при сохранении расчета:', error);
  }
}

export async function getHistory(): Promise<CalculationHistory[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const history = JSON.parse(data);
      // Преобразуем строки дат обратно в объекты Date
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    }
    return [];
  } catch (error) {
    console.error('Ошибка при загрузке истории:', error);
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Ошибка при очистке истории:', error);
  }
}

export async function deleteCalculation(id: string): Promise<void> {
  try {
    const history = await getHistory();
    const filtered = history.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Ошибка при удалении расчета:', error);
  }
}
