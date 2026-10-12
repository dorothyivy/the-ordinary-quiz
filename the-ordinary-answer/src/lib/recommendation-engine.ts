import { products } from '@/data/products';
import { conflictRules } from '@/data/conflicts';
import type {
  SkinProfile,
  Product,
  RoutineRecommendation,
  RecommendedProduct,
  ConflictWarning,
  SkinConcern,
  QuizAnswer,
} from '@/types';

// ─── Build Skin Profile from Quiz Answers ────────────────────
export function buildSkinProfile(answers: QuizAnswer[]): SkinProfile {
  const getAnswer = (qId: string): string[] => {
    const answer = answers.find(a => a.questionId === qId);
    return answer?.selectedValues ?? [];
  };

  const getSingle = (qId: string): string => getAnswer(qId)[0] ?? '';

  return {
    skinType: (getSingle('skin-type') || 'normal') as SkinProfile['skinType'],
    concerns: getAnswer('primary-concerns').concat(getAnswer('secondary-concerns')) as SkinConcern[],
    age: (getSingle('age-range') || '25-34') as SkinProfile['age'],
    experience: (getSingle('experience-level') || 'beginner') as SkinProfile['experience'],
    routinePreference: (getSingle('routine-preference') || 'moderate') as SkinProfile['routinePreference'],
    timePreference: (getSingle('time-preference') || 'both') as SkinProfile['timePreference'],
    budget: (getSingle('budget') || 'moderate') as SkinProfile['budget'],
    climate: (getSingle('climate') || 'temperate') as SkinProfile['climate'],
    sensitivities: getAnswer('sensitivities').filter(s => s !== 'none'),
    currentProducts: getAnswer('current-products').filter(s => s !== 'none-current'),
    sunExposure: (getSingle('sun-exposure') || 'moderate') as SkinProfile['sunExposure'],
    pregnancyStatus: getSingle('pregnancy') === 'true',
  };
}

// ─── Score Products ──────────────────────────────────────────
function scoreProduct(product: Product, profile: SkinProfile): number {
  let score = 0;

  // Skin type match (high weight)
  if (product.suitableSkinTypes.includes(profile.skinType)) {
    score += 30;
  }

  // Concern match (highest weight)
  const concernMatches = product.targetConcerns.filter(c =>
    profile.concerns.includes(c)
  ).length;
  score += concernMatches * 25;

  // Experience level match
  if (product.experienceLevel.includes(profile.experience)) {
    score += 15;
  } else {
    score -= 20; // Penalize if not suitable for experience level
  }

  // Essential products get a bonus
  if (product.isEssential) {
    score += 20;
  }

  // Budget consideration
  if (profile.budget === 'budget' && product.price > 15) {
    score -= 10;
  }

  // Pregnancy safety
  if (profile.pregnancyStatus) {
    if (product.category === 'retinoid') {
      return -100; // Completely exclude retinoids
    }
    if (product.keyIngredients.some(i => i.toLowerCase().includes('salicylic'))) {
      score -= 30;
    }
  }

  // Sensitivity check
  if (profile.sensitivities.includes('retinol') && product.category === 'retinoid') {
    return -100;
  }
  if (profile.sensitivities.includes('acids') && product.category === 'exfoliant') {
    score -= 40;
  }

  // Climate adjustments
  if (profile.climate === 'humid' || profile.climate === 'tropical') {
    if (product.format === 'Oil' || product.format === 'Cream') {
      score -= 5; // Prefer lighter textures
    }
  }
  if (profile.climate === 'dry' || profile.climate === 'cold') {
    if (product.format === 'Oil' || product.format === 'Cream') {
      score += 5; // Prefer richer textures
    }
  }

  // Goal boost from question 15
  const goalConcernMap: Record<string, SkinConcern[]> = {
    'clear-skin': ['acne', 'pores', 'oiliness'],
    'glowing-skin': ['dullness', 'texture', 'dehydration'],
    'anti-aging': ['aging', 'fine-lines', 'sun-damage'],
    'even-tone': ['hyperpigmentation', 'uneven-tone', 'redness'],
    'hydration': ['dehydration', 'dryness', 'sensitivity'],
  };

  const goalConcerns = Object.values(goalConcernMap).flat();
  const goalMatches = product.targetConcerns.filter(c => goalConcerns.includes(c));
  score += goalMatches.length * 10;

  return score;
}

// ─── Check Conflicts Between Two Products ────────────────────
function getConflictsBetween(a: Product, b: Product): ConflictWarning[] {
  const warnings: ConflictWarning[] = [];

  for (const rule of conflictRules) {
    const aIngredients = a.keyIngredients.join(' ').toLowerCase();
    const bIngredients = b.keyIngredients.join(' ').toLowerCase();

    const match1 =
      aIngredients.includes(rule.ingredientA.toLowerCase()) &&
      bIngredients.includes(rule.ingredientB.toLowerCase());
    const match2 =
      aIngredients.includes(rule.ingredientB.toLowerCase()) &&
      bIngredients.includes(rule.ingredientA.toLowerCase());

    if (match1 || match2) {
      warnings.push({
        products: [a.name, b.name],
        reason: rule.reason,
        severity: rule.severity,
        resolution: rule.resolution,
      });
    }
  }

  // Also check the product's own conflict list
  if (a.conflicts.some(c => b.id.includes(c) || b.category.includes(c))) {
    warnings.push({
      products: [a.name, b.name],
      reason: `${a.name} lists a conflict with ${b.name} or its category.`,
      severity: 'caution',
      resolution: 'Use on alternate days or separate AM/PM routines.',
    });
  }

  return warnings;
}

// ─── Determine Max Products Based on Preference ──────────────
function getMaxProducts(preference: string): { am: number; pm: number; weekly: number } {
  switch (preference) {
    case 'minimal':
      return { am: 3, pm: 3, weekly: 0 };
    case 'moderate':
      return { am: 4, pm: 5, weekly: 1 };
    case 'comprehensive':
      return { am: 5, pm: 7, weekly: 2 };
    default:
      return { am: 4, pm: 5, weekly: 1 };
  }
}

// ─── Main Recommendation Function ────────────────────────────
export function generateRecommendation(profile: SkinProfile): RoutineRecommendation {
  const maxProducts = getMaxProducts(profile.routinePreference);

  // Score all products
  const scored = products
    .map(product => ({
      product,
      score: scoreProduct(product, profile),
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const morningProducts: RecommendedProduct[] = [];
  const eveningProducts: RecommendedProduct[] = [];
  const weeklyProducts: RecommendedProduct[] = [];
  const allConflicts: ConflictWarning[] = [];
  const usedCategories = new Set<string>();
  const selectedProducts: Product[] = [];

  // Helper to check if adding a product creates conflicts
  function wouldConflict(candidate: Product, existing: Product[]): boolean {
    for (const p of existing) {
      const conflicts = getConflictsBetween(candidate, p);
      if (conflicts.some(c => c.severity === 'avoid')) {
        return true;
      }
    }
    return false;
  }

  // Helper to find alternatives for a product
  function findAlternatives(product: Product): Product[] {
    return scored
      .filter(s =>
        s.product.id !== product.id &&
        s.product.category === product.category &&
        !selectedProducts.includes(s.product)
      )
      .slice(0, 2)
      .map(s => s.product);
  }

  // Step order for routine
  const routineOrder: Record<string, number> = {
    cleanse: 1,
    tone: 2,
    'treat-water': 3,
    'treat-oil': 4,
    moisturize: 5,
    protect: 6,
    eye: 3.5,
    exfoliate: 2.5,
    mask: 7,
  };

  // Build morning routine
  for (const { product } of scored) {
    if (morningProducts.length >= maxProducts.am) break;
    if (product.timeOfDay === 'evening') continue;

    const routineKey = `${product.routineStep}-am`;
    if (usedCategories.has(routineKey)) continue;

    // Check for conflicts with existing morning products
    const amProducts = morningProducts.map(rp => rp.product);
    if (wouldConflict(product, amProducts)) continue;

    const priority = product.isEssential ? 'essential' : (
      morningProducts.length < 3 ? 'recommended' : 'optional'
    );

    morningProducts.push({
      product,
      step: routineOrder[product.routineStep] || 3,
      reason: generateReason(product, profile),
      priority,
      alternatives: findAlternatives(product),
    });

    usedCategories.add(routineKey);
    selectedProducts.push(product);
  }

  // Build evening routine
  usedCategories.clear();
  for (const { product } of scored) {
    if (eveningProducts.length >= maxProducts.pm) break;
    if (product.timeOfDay === 'morning') continue;
    if (product.routineStep === 'protect') continue; // No SPF at night

    const routineKey = `${product.routineStep}-pm`;
    if (usedCategories.has(routineKey) && product.routineStep !== 'treat-water' && product.routineStep !== 'treat-oil') continue;

    // Check for conflicts with existing evening products
    const pmProducts = eveningProducts.map(rp => rp.product);
    if (wouldConflict(product, pmProducts)) continue;

    // Allow one product per step (except treatments which can have 2)
    const stepCount = eveningProducts.filter(rp => rp.product.routineStep === product.routineStep).length;
    if (stepCount >= 2) continue;

    const priority = product.isEssential ? 'essential' : (
      eveningProducts.length < 3 ? 'recommended' : 'optional'
    );

    eveningProducts.push({
      product,
      step: routineOrder[product.routineStep] || 3,
      reason: generateReason(product, profile),
      priority,
      alternatives: findAlternatives(product),
    });

    usedCategories.add(routineKey);
    selectedProducts.push(product);
  }

  // Add weekly treatments (masks, peels)
  for (const { product } of scored) {
    if (weeklyProducts.length >= maxProducts.weekly) break;
    if (product.routineStep !== 'mask' && product.routineStep !== 'exfoliate') continue;
    if (selectedProducts.includes(product)) continue;

    weeklyProducts.push({
      product,
      step: 1,
      reason: generateReason(product, profile),
      priority: 'optional',
      alternatives: findAlternatives(product),
    });
    selectedProducts.push(product);
  }

  // Sort by step order
  morningProducts.sort((a, b) => a.step - b.step);
  eveningProducts.sort((a, b) => a.step - b.step);

  // Collect all conflict warnings
  for (let i = 0; i < selectedProducts.length; i++) {
    for (let j = i + 1; j < selectedProducts.length; j++) {
      const conflicts = getConflictsBetween(selectedProducts[i], selectedProducts[j]);
      allConflicts.push(...conflicts);
    }
  }

  // Deduplicate conflicts
  const uniqueConflicts = allConflicts.filter((c, i) => {
    const key = c.products.sort().join('-');
    return allConflicts.findIndex(cc => cc.products.sort().join('-') === key) === i;
  });

  // Calculate total cost
  const totalCost = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  return {
    morning: morningProducts,
    evening: eveningProducts,
    weekly: weeklyProducts,
    totalCost,
    conflictWarnings: uniqueConflicts.filter(c => c.severity !== 'timing'),
  };
}

// ─── Generate Human-Readable Reason ──────────────────────────
function generateReason(product: Product, profile: SkinProfile): string {
  const matchedConcerns = product.targetConcerns.filter(c =>
    profile.concerns.includes(c)
  );

  if (product.isEssential) {
    return `Essential step for ${profile.skinType} skin.`;
  }

  if (matchedConcerns.length > 0) {
    const formatted = matchedConcerns
      .map(c => c.replace(/-/g, ' '))
      .slice(0, 2)
      .join(' and ');
    return `Targets your ${formatted} concern${matchedConcerns.length > 1 ? 's' : ''}.`;
  }

  return `Recommended for ${profile.skinType} skin in ${profile.climate} climates.`;
}
