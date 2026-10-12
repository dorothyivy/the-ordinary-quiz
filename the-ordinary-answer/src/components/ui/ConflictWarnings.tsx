'use client';

import { motion } from 'framer-motion';
import type { ConflictWarning } from '@/types';
import { cn } from '@/lib/utils';

interface ConflictWarningsProps {
  warnings: ConflictWarning[];
}

export function ConflictWarnings({ warnings }: ConflictWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 className="font-display text-lg text-amber-900">
          Ingredient Conflict Warnings
        </h3>
      </div>

      <div className="space-y-4">
        {warnings.map((warning, i) => (
          <div
            key={i}
            className={cn(
              'p-4 rounded-xl border',
              warning.severity === 'avoid'
                ? 'bg-red-50/50 border-red-200'
                : 'bg-amber-50/50 border-amber-200'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  warning.severity === 'avoid' ? 'badge-avoid' : 'badge-caution'
                )}
              >
                {warning.severity === 'avoid' ? 'Avoid Combining' : 'Use with Caution'}
              </span>
            </div>

            <p className="text-sm font-medium text-brand-charcoal mb-1">
              {warning.products[0]} + {warning.products[1]}
            </p>
            <p className="text-sm text-brand-graphite mb-2">{warning.reason}</p>
            <p className="text-xs text-brand-slate">
              <span className="font-medium">Resolution:</span> {warning.resolution}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
