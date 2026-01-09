export interface ParenteralNutrition {
  glucose: {
    volume: number; // мл
    concentration: number; // % (например, 10% = 10)
  };
  aminoAcids: {
    volume: number; // мл
    concentration: number; // % (например, 10% = 10)
  };
  lipids: {
    volume: number; // мл
    concentration: number; // % (например, 20% = 20)
  };
}

export interface NutritionCalculation {
  glucose: {
    grams: number;
    calories: number;
  };
  aminoAcids: {
    grams: number;
    calories: number;
  };
  lipids: {
    grams: number;
    calories: number;
  };
  total: {
    calories: number;
    volume: number; // общий объем в мл
  };
}

export interface CalculationHistory {
  id: string;
  timestamp: Date;
  input: ParenteralNutrition;
  result: NutritionCalculation;
}
