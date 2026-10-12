'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion, QuizAnswer } from '@/types';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: QuizQuestion;
  existingAnswer?: QuizAnswer;
  onAnswer: (answer: QuizAnswer) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function QuestionCard({
  question,
  existingAnswer,
  onAnswer,
  onNext,
  onBack,
  isFirst,
  isLast,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>(
    existingAnswer?.selectedValues ?? []
  );

  const handleSelect = useCallback(
    (value: string) => {
      let newSelected: string[];

      if (question.type === 'single') {
        newSelected = [value];
      } else {
        if (selected.includes(value)) {
          newSelected = selected.filter((v) => v !== value);
        } else {
          if (question.maxSelections && selected.length >= question.maxSelections) {
            // Remove the first selection and add the new one
            newSelected = [...selected.slice(1), value];
          } else {
            newSelected = [...selected, value];
          }
        }
      }

      setSelected(newSelected);
      onAnswer({
        questionId: question.id,
        selectedValues: newSelected,
      });

      // Auto-advance for single-select after a brief delay
      if (question.type === 'single' && !isLast) {
        setTimeout(() => onNext(), 400);
      }
    },
    [selected, question, onAnswer, onNext, isLast]
  );

  const canProceed = selected.length > 0;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="quiz-card max-w-xl mx-auto"
    >
      {/* Question Header */}
      <div className="mb-6">
        <span className="text-xs uppercase tracking-widest text-brand-slate font-medium">
          {question.category.replace('-', ' ')}
        </span>
        <h2 className="font-display text-2xl md:text-3xl text-brand-charcoal mt-2 mb-1">
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="text-sm text-brand-slate mt-1">{question.subtitle}</p>
        )}
        {question.type === 'multiple' && question.maxSelections && (
          <p className="text-xs text-brand-coral mt-2 font-medium">
            Select up to {question.maxSelections} · {selected.length} selected
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selected.includes(option.value);
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'option-card w-full text-left',
                isSelected && 'selected'
              )}
            >
              {/* Selection indicator */}
              <div
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 transition-all duration-200 flex items-center justify-center',
                  isSelected
                    ? 'border-brand-charcoal bg-brand-charcoal'
                    : 'border-brand-sand'
                )}
              >
                {isSelected && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {option.icon && (
                    <span className="text-lg">{option.icon}</span>
                  )}
                  <span className="font-medium text-brand-charcoal">
                    {option.label}
                  </span>
                </div>
                {option.description && (
                  <p className="text-sm text-brand-slate mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-brand-sand/30">
        <button
          onClick={onBack}
          disabled={isFirst}
          className={cn(
            'btn-secondary text-sm',
            isFirst && 'opacity-0 pointer-events-none'
          )}
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          Back
        </button>

        {(question.type === 'multiple' || isLast) && (
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="btn-primary text-sm"
          >
            {isLast ? 'See My Results' : 'Next'}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}
