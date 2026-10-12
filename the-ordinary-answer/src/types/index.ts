// ─── Skin Profile Types ──────────────────────────────────────────
export type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
export type SkinConcern =
  | 'acne'
  | 'aging'
  | 'hyperpigmentation'
  | 'dullness'
  | 'texture'
  | 'redness'
  | 'dryness'
  | 'oiliness'
  | 'pores'
  | 'dark-circles'
  | 'uneven-tone'
  | 'fine-lines'
  | 'sun-damage'
  | 'sensitivity'
  | 'dehydration';

export type AgeRange = '16-24' | '25-34' | '35-44' | '45-54' | '55+';
export type SkincareExperience = 'beginner' | 'intermediate' | 'advanced';
export type RoutinePreference = 'minimal' | 'moderate' | 'comprehensive';
export type TimeOfDay = 'morning' | 'evening' | 'both';
export type BudgetRange = 'budget' | 'moderate' | 'flexible';
export type Climate = 'humid' | 'dry' | 'temperate' | 'cold' | 'tropical';

// ─── Quiz Types ──────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  number: number;
  question: string;
  subtitle?: string;
  type: 'single' | 'multiple' | 'scale';
  options: QuizOption[];
  maxSelections?: number;
  category: 'skin-profile' | 'concerns' | 'lifestyle' | 'preferences';
}

export interface QuizOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  value: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedValues: string[];
}

export interface QuizState {
  currentQuestion: number;
  answers: QuizAnswer[];
  isComplete: boolean;
}

// ─── Product Types ───────────────────────────────────────────────
export type ProductCategory =
  | 'cleanser'
  | 'toner'
  | 'serum'
  | 'moisturizer'
  | 'sunscreen'
  | 'exfoliant'
  | 'oil'
  | 'mask'
  | 'eye-care'
  | 'treatment'
  | 'retinoid'
  | 'antioxidant'
  | 'peptide'
  | 'acid'
  | 'vitamin';

export type RoutineStep =
  | 'cleanse'
  | 'tone'
  | 'treat-water'
  | 'treat-oil'
  | 'moisturize'
  | 'protect'
  | 'exfoliate'
  | 'mask'
  | 'eye';

export interface Product {
  id: string;
  name: string;
  fullName: string;
  category: ProductCategory;
  routineStep: RoutineStep;
  price: number;
  size: string;
  keyIngredients: string[];
  conflicts: string[];
  targetConcerns: SkinConcern[];
  suitableSkinTypes: SkinType[];
  experienceLevel: SkincareExperience[];
  timeOfDay: TimeOfDay[];
  description: string;
  howToUse: string;
  frequency: string;
  pH?: string;
  format: string;
  isEssential: boolean;
}

// ─── Recommendation Types ────────────────────────────────────────
export interface SkinProfile {
  skinType: SkinType;
  concerns: SkinConcern[];
  age: AgeRange;
  experience: SkincareExperience;
  routinePreference: RoutinePreference;
  timePreference: TimeOfDay;
  budget: BudgetRange;
  climate: Climate;
  sensitivities: string[];
  currentProducts: string[];
  sunExposure: 'low' | 'moderate' | 'high';
  pregnancyStatus: boolean;
}

export interface RoutineRecommendation {
  morning: RecommendedProduct[];
  evening: RecommendedProduct[];
  weekly: RecommendedProduct[];
  totalCost: number;
  conflictWarnings: ConflictWarning[];
}

export interface RecommendedProduct {
  product: Product;
  step: number;
  reason: string;
  priority: 'essential' | 'recommended' | 'optional';
  alternatives: Product[];
}

export interface ConflictWarning {
  products: [string, string];
  reason: string;
  severity: 'avoid' | 'caution' | 'timing';
  resolution: string;
}

// ─── Klaviyo Types ───────────────────────────────────────────────
export interface KlaviyoPayload {
  email: string;
  phone?: string;
  firstName?: string;
  skinProfile: SkinProfile;
  recommendation: RoutineRecommendation;
  quizCompletedAt: string;
}

// ─── Encoding helpers ────────────────────────────────────────────
export interface EncodedResults {
  data: string; // btoa-encoded JSON
  version: string;
}
