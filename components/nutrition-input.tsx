import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

interface NutritionInputProps {
  label: string;
  volume: string;
  concentration: string;
  onVolumeChange: (value: string) => void;
  onConcentrationChange: (value: string) => void;
  volumeUnit?: string;
  concentrationUnit?: string;
}

export function NutritionInput({
  label,
  volume,
  concentration,
  onVolumeChange,
  onConcentrationChange,
  volumeUnit = 'мл',
  concentrationUnit = '%',
}: NutritionInputProps) {
  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Объем ({volumeUnit})</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            value={volume}
            onChangeText={onVolumeChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={borderColor}
          />
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Концентрация ({concentrationUnit})</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            value={concentration}
            onChangeText={onConcentrationChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={borderColor}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    marginBottom: 14,
    fontSize: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    minHeight: 48,
  },
});
