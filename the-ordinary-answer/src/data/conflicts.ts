/**
 * Ingredient Conflict Checking System
 *
 * Maps product ingredient categories to their known conflicts.
 * Used by the recommendation engine to ensure safe routines.
 */

export interface ConflictRule {
  ingredientA: string;
  ingredientB: string;
  severity: 'avoid' | 'caution' | 'timing';
  reason: string;
  resolution: string;
}

export const conflictRules: ConflictRule[] = [
  // ── Retinoids vs Acids ─────────────────────────────────────
  {
    ingredientA: 'retinol',
    ingredientB: 'glycolic acid',
    severity: 'avoid',
    reason: 'Both increase skin cell turnover and can cause severe irritation, peeling, and barrier damage when combined.',
    resolution: 'Use retinol on some nights and glycolic acid on alternate nights. Never layer together.',
  },
  {
    ingredientA: 'retinol',
    ingredientB: 'salicylic acid',
    severity: 'caution',
    reason: 'Can increase dryness and irritation when used together, especially at higher concentrations.',
    resolution: 'Use salicylic acid in AM and retinol in PM, or alternate nights.',
  },
  {
    ingredientA: 'retinol',
    ingredientB: 'lactic acid',
    severity: 'avoid',
    reason: 'Both exfoliate and can cause excessive irritation, redness, and peeling.',
    resolution: 'Use on alternate nights. Never layer together.',
  },
  {
    ingredientA: 'retinol',
    ingredientB: 'AHA/BHA peel',
    severity: 'avoid',
    reason: 'The peel is extremely potent and combining with retinol risks chemical burns.',
    resolution: 'Do not use retinol for 48 hours before or after using the AHA/BHA peel.',
  },

  // ── Vitamin C vs Others ────────────────────────────────────
  {
    ingredientA: 'vitamin C (ascorbic acid)',
    ingredientB: 'niacinamide',
    severity: 'timing',
    reason: 'While modern formulations are generally safe together, they can reduce each other\'s effectiveness and cause flushing.',
    resolution: 'Use vitamin C in AM and niacinamide in PM, or wait 15-30 minutes between application.',
  },
  {
    ingredientA: 'vitamin C (ascorbic acid)',
    ingredientB: 'retinol',
    severity: 'timing',
    reason: 'Both are potent actives. Vitamin C works best at low pH, retinol at higher pH.',
    resolution: 'Use vitamin C in AM (with SPF) and retinol in PM.',
  },
  {
    ingredientA: 'vitamin C (ascorbic acid)',
    ingredientB: 'AHA/BHA acids',
    severity: 'caution',
    reason: 'Both work at low pH levels and can cause irritation when layered together.',
    resolution: 'Use vitamin C in AM and acids in PM.',
  },
  {
    ingredientA: 'vitamin C',
    ingredientB: 'copper peptides',
    severity: 'avoid',
    reason: 'Copper peptides oxidize vitamin C, rendering both ingredients ineffective.',
    resolution: 'Use on completely different routines — vitamin C in AM, copper peptides in PM.',
  },

  // ── AHA/BHA vs Others ──────────────────────────────────────
  {
    ingredientA: 'glycolic acid',
    ingredientB: 'salicylic acid',
    severity: 'caution',
    reason: 'Layering multiple acids increases risk of over-exfoliation and irritation.',
    resolution: 'Alternate between them or use one in AM and one in PM.',
  },
  {
    ingredientA: 'AHA/BHA peel',
    ingredientB: 'any direct acid',
    severity: 'avoid',
    reason: 'The 30% AHA + 2% BHA peel is extremely potent. Adding more acids risks chemical burns.',
    resolution: 'Do not use any other acid on the same day as the peel.',
  },
  {
    ingredientA: 'direct acids',
    ingredientB: 'peptides',
    severity: 'timing',
    reason: 'Low pH of acids can deactivate peptide bonds, reducing their effectiveness.',
    resolution: 'Use acids in PM and peptides in AM, or apply peptides 30 minutes after acids.',
  },

  // ── Copper Peptides (special case) ─────────────────────────
  {
    ingredientA: 'copper peptides',
    ingredientB: 'retinol',
    severity: 'avoid',
    reason: 'Copper peptides should not be combined with most strong actives.',
    resolution: 'Use copper peptides in a separate routine from retinol.',
  },
  {
    ingredientA: 'copper peptides',
    ingredientB: 'direct acids',
    severity: 'avoid',
    reason: 'Acids disrupt the peptide structure of copper peptides.',
    resolution: 'Use on completely separate days or routines.',
  },
  {
    ingredientA: 'copper peptides',
    ingredientB: 'EUK 134',
    severity: 'avoid',
    reason: 'EUK 134 is incompatible with copper peptides and reduces effectiveness.',
    resolution: 'Choose one or the other; do not combine.',
  },

  // ── Pregnancy Safety ───────────────────────────────────────
  {
    ingredientA: 'retinol',
    ingredientB: 'pregnancy',
    severity: 'avoid',
    reason: 'Retinoids (all forms) should be completely avoided during pregnancy and nursing.',
    resolution: 'Replace with pregnancy-safe alternatives like vitamin C, niacinamide, or azelaic acid.',
  },
  {
    ingredientA: 'salicylic acid (>2%)',
    ingredientB: 'pregnancy',
    severity: 'caution',
    reason: 'High-dose salicylic acid should be avoided during pregnancy. Low doses in cleansers are generally okay.',
    resolution: 'Use a salicylic acid cleanser (low concentration) instead of leave-on treatments.',
  },
];

/**
 * Check if two product IDs have conflicts
 */
export function checkProductConflict(
  productAIngredients: string[],
  productBIngredients: string[]
): ConflictRule[] {
  const conflicts: ConflictRule[] = [];

  for (const rule of conflictRules) {
    const aHasIngredientA = productAIngredients.some(i =>
      i.toLowerCase().includes(rule.ingredientA.toLowerCase())
    );
    const bHasIngredientB = productBIngredients.some(i =>
      i.toLowerCase().includes(rule.ingredientB.toLowerCase())
    );
    const aHasIngredientB = productAIngredients.some(i =>
      i.toLowerCase().includes(rule.ingredientB.toLowerCase())
    );
    const bHasIngredientA = productBIngredients.some(i =>
      i.toLowerCase().includes(rule.ingredientA.toLowerCase())
    );

    if ((aHasIngredientA && bHasIngredientB) || (aHasIngredientB && bHasIngredientA)) {
      conflicts.push(rule);
    }
  }

  return conflicts;
}

/**
 * Check all products in a routine for conflicts
 */
export function checkRoutineConflicts(
  productIds: string[],
  getIngredients: (id: string) => string[]
): ConflictRule[] {
  const allConflicts: ConflictRule[] = [];

  for (let i = 0; i < productIds.length; i++) {
    for (let j = i + 1; j < productIds.length; j++) {
      const conflicts = checkProductConflict(
        getIngredients(productIds[i]),
        getIngredients(productIds[j])
      );
      allConflicts.push(...conflicts);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return allConflicts.filter(c => {
    const key = `${c.ingredientA}-${c.ingredientB}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
