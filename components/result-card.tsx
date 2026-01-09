import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { NutritionCalculation } from '@/types/nutrition';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ResultCardProps {
  calculation: NutritionCalculation;
}

export function ResultCard({ calculation }: ResultCardProps) {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[styles.totalCalories, { color: tintColor }]}>
        {calculation.total.calories} ккал
      </ThemedText>
      <ThemedText style={styles.totalVolume}>
        Общий объем: {calculation.total.volume} мл
      </ThemedText>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Глюкоза:</ThemedText>
          <ThemedText style={styles.detailValue}>
            {calculation.glucose.grams} г ({calculation.glucose.calories} ккал)
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Аминокислоты:</ThemedText>
          <ThemedText style={styles.detailValue}>
            {calculation.aminoAcids.grams} г ({calculation.aminoAcids.calories} ккал)
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Липиды:</ThemedText>
          <ThemedText style={styles.detailValue}>
            {calculation.lipids.grams} г ({calculation.lipids.calories} ккал)
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 28,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalCalories: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 50,
    paddingTop: 4,
  },
  totalVolume: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 22,
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
});
