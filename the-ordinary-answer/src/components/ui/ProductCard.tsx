'use client';

import { motion } from 'framer-motion';
import type { RecommendedProduct } from '@/types';
import { formatPrice, cn } from '@/lib/utils';

interface ProductCardProps {
  item: RecommendedProduct;
  index: number;
  showStep?: boolean;
}

export function ProductCard({ item, index, showStep = true }: ProductCardProps) {
  const { product, step, reason, priority, alternatives } = item;

  const priorityBadge = {
    essential: 'badge-essential',
    recommended: 'badge-recommended',
    optional: 'badge-optional',
  }[priority];

  const priorityLabel = {
    essential: 'Essential',
    recommended: 'Recommended',
    optional: 'Optional',
  }[priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="product-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {showStep && (
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-sand/50 text-xs font-bold text-brand-charcoal">
              {step}
            </span>
          )}
          <span className={cn(priorityBadge)}>{priorityLabel}</span>
        </div>
        <span className="text-lg font-semibold text-brand-charcoal">
          {formatPrice(product.price)}
        </span>
      </div>

      <h3 className="font-display text-lg text-brand-charcoal mb-1">
        {product.name}
      </h3>
      <p className="text-xs text-brand-slate mb-2">{product.size} · {product.format}</p>

      <p className="text-sm text-brand-graphite mb-3">{product.description}</p>

      <div className="bg-brand-cream/50 rounded-lg p-3 mb-3">
        <p className="text-xs font-medium text-brand-coral mb-1">Why this product:</p>
        <p className="text-sm text-brand-graphite">{reason}</p>
      </div>

      {/* Key Ingredients */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {product.keyIngredients.slice(0, 3).map((ingredient) => (
          <span
            key={ingredient}
            className="px-2 py-0.5 rounded-full bg-brand-sage/10 text-xs text-brand-graphite"
          >
            {ingredient}
          </span>
        ))}
      </div>

      {/* How to Use */}
      <details className="group">
        <summary className="text-xs font-medium text-brand-slate cursor-pointer hover:text-brand-charcoal transition-colors">
          How to use ▾
        </summary>
        <div className="mt-2 text-sm text-brand-graphite space-y-1">
          <p>{product.howToUse}</p>
          <p className="text-xs text-brand-slate">
            Frequency: {product.frequency}
          </p>
        </div>
      </details>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <details className="mt-2 group">
          <summary className="text-xs font-medium text-brand-slate cursor-pointer hover:text-brand-charcoal transition-colors">
            {alternatives.length} alternative{alternatives.length > 1 ? 's' : ''} ▾
          </summary>
          <div className="mt-2 space-y-1">
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                className="flex justify-between items-center text-xs text-brand-slate py-1"
              >
                <span>{alt.name}</span>
                <span>{formatPrice(alt.price)}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </motion.div>
  );
}
