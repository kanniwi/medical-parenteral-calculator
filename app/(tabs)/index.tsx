import { NutritionInput } from '@/components/nutrition-input';
import { ResultCard } from '@/components/result-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { NutritionCalculation, ParenteralNutrition } from '@/types/nutrition';
import { calculationsAPI } from '@/utils/api';
import { calculateNutrition } from '@/utils/calculations';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalculatorScreen() {
  const [glucoseVolume, setGlucoseVolume] = useState('');
  const [glucoseConcentration, setGlucoseConcentration] = useState('');
  const [aminoAcidsVolume, setAminoAcidsVolume] = useState('');
  const [aminoAcidsConcentration, setAminoAcidsConcentration] = useState('');
  const [lipidsVolume, setLipidsVolume] = useState('');
  const [lipidsConcentration, setLipidsConcentration] = useState('');
  const [result, setResult] = useState<NutritionCalculation | null>(null);

  const tintColor = useThemeColor({}, 'tint');

  const handleCalculate = async () => {
    // Проверка на пустые значения
    if (
      !glucoseVolume ||
      !glucoseConcentration ||
      !aminoAcidsVolume ||
      !aminoAcidsConcentration ||
      !lipidsVolume ||
      !lipidsConcentration
    ) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const volumeGlucose = parseFloat(glucoseVolume);
    const concGlucose = parseFloat(glucoseConcentration);
    const volumeAmino = parseFloat(aminoAcidsVolume);
    const concAmino = parseFloat(aminoAcidsConcentration);
    const volumeLipids = parseFloat(lipidsVolume);
    const concLipids = parseFloat(lipidsConcentration);

    // Проверка на валидность чисел
    if (
      isNaN(volumeGlucose) ||
      isNaN(concGlucose) ||
      isNaN(volumeAmino) ||
      isNaN(concAmino) ||
      isNaN(volumeLipids) ||
      isNaN(concLipids) ||
      volumeGlucose < 0 ||
      concGlucose < 0 ||
      volumeAmino < 0 ||
      concAmino < 0 ||
      volumeLipids < 0 ||
      concLipids < 0
    ) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректные положительные числа');
      return;
    }

    const input: ParenteralNutrition = {
      glucose: {
        volume: volumeGlucose,
        concentration: concGlucose,
      },
      aminoAcids: {
        volume: volumeAmino,
        concentration: concAmino,
      },
      lipids: {
        volume: volumeLipids,
        concentration: concLipids,
      },
    };

    const calculation = calculateNutrition(input);
    setResult(calculation);

    // Сохраняем в базу данных через API
    try {
      await calculationsAPI.create({
        glucose_volume: input.glucose.volume,
        glucose_concentration: input.glucose.concentration,
        amino_acids_volume: input.aminoAcids.volume,
        amino_acids_concentration: input.aminoAcids.concentration,
        lipids_volume: input.lipids.volume,
        lipids_concentration: input.lipids.concentration,
        glucose_grams: calculation.glucose.grams,
        glucose_calories: calculation.glucose.calories,
        amino_acids_grams: calculation.aminoAcids.grams,
        amino_acids_calories: calculation.aminoAcids.calories,
        lipids_grams: calculation.lipids.grams,
        lipids_calories: calculation.lipids.calories,
        total_calories: calculation.total.calories,
        total_volume: calculation.total.volume,
      });
    } catch (error: any) {
      console.error('Save calculation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.errors 
        ? error.response.data.errors.map((e: any) => e.msg).join('\n')
        : error.response?.data?.error || 'Не удалось сохранить расчет';
      
      Alert.alert('Ошибка сохранения', errorMessage);
    }
  };

  const handleReset = () => {
    setGlucoseVolume('');
    setGlucoseConcentration('');
    setAminoAcidsVolume('');
    setAminoAcidsConcentration('');
    setLipidsVolume('');
    setLipidsConcentration('');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Калькулятор парентерального питания
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Введите объем и концентрацию компонентов для расчета калорийности
            </ThemedText>
          </ThemedView>

        <NutritionInput
          label="Глюкоза"
          volume={glucoseVolume}
          concentration={glucoseConcentration}
          onVolumeChange={setGlucoseVolume}
          onConcentrationChange={setGlucoseConcentration}
        />

        <NutritionInput
          label="Аминокислоты"
          volume={aminoAcidsVolume}
          concentration={aminoAcidsConcentration}
          onVolumeChange={setAminoAcidsVolume}
          onConcentrationChange={setAminoAcidsConcentration}
        />

        <NutritionInput
          label="Липиды"
          volume={lipidsVolume}
          concentration={lipidsConcentration}
          onVolumeChange={setLipidsVolume}
          onConcentrationChange={setLipidsConcentration}
        />

        <TouchableOpacity
          style={[styles.calculateButton, { backgroundColor: tintColor }]}
          onPress={handleCalculate}
          activeOpacity={0.8}>
          <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#000000">
            Рассчитать
          </ThemedText>
        </TouchableOpacity>

        {result && (
          <>
            <ResultCard calculation={result} />
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: tintColor }]}
              onPress={handleReset}>
              <ThemedText style={[styles.resetButtonText, { color: tintColor }]}>
                Сбросить
              </ThemedText>
            </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  calculateButton: {
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
  resetButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
