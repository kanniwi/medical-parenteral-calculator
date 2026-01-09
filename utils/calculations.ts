import { ParenteralNutrition, NutritionCalculation } from '@/types/nutrition';

// Калорийность на грамм
const CALORIES_PER_GRAM = {
  glucose: 4, // ккал/г
  aminoAcids: 4, // ккал/г
  lipids: 9, // ккал/г
};

/**
 * Рассчитывает количество граммов вещества в растворе
 * @param volume объем в мл
 * @param concentration концентрация в % (например, 10 для 10%)
 * @returns количество граммов
 */
function calculateGrams(volume: number, concentration: number): number {
  // Концентрация в % означает граммы на 100 мл
  return (volume * concentration) / 100;
}

/**
 * Рассчитывает калорийность парентерального питания
 */
export function calculateNutrition(input: ParenteralNutrition): NutritionCalculation {
  // Расчет глюкозы
  const glucoseGrams = calculateGrams(input.glucose.volume, input.glucose.concentration);
  const glucoseCalories = glucoseGrams * CALORIES_PER_GRAM.glucose;

  // Расчет аминокислот
  const aminoAcidsGrams = calculateGrams(input.aminoAcids.volume, input.aminoAcids.concentration);
  const aminoAcidsCalories = aminoAcidsGrams * CALORIES_PER_GRAM.aminoAcids;

  // Расчет липидов
  const lipidsGrams = calculateGrams(input.lipids.volume, input.lipids.concentration);
  const lipidsCalories = lipidsGrams * CALORIES_PER_GRAM.lipids;

  // Общая калорийность
  const totalCalories = glucoseCalories + aminoAcidsCalories + lipidsCalories;

  // Общий объем
  const totalVolume = input.glucose.volume + input.aminoAcids.volume + input.lipids.volume;

  return {
    glucose: {
      grams: Math.round(glucoseGrams * 100) / 100,
      calories: Math.round(glucoseCalories * 100) / 100,
    },
    aminoAcids: {
      grams: Math.round(aminoAcidsGrams * 100) / 100,
      calories: Math.round(aminoAcidsCalories * 100) / 100,
    },
    lipids: {
      grams: Math.round(lipidsGrams * 100) / 100,
      calories: Math.round(lipidsCalories * 100) / 100,
    },
    total: {
      calories: Math.round(totalCalories * 100) / 100,
      volume: Math.round(totalVolume * 100) / 100,
    },
  };
}
