'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { quizQuestions } from '@/data/questions';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { buildSkinProfile, generateRecommendation } from '@/lib/recommendation-engine';
import type { QuizAnswer } from '@/types';

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const question = quizQuestions[currentQuestion];

  const handleAnswer = useCallback(
    (answer: QuizAnswer) => {
      setAnswers((prev) => {
        const existing = prev.findIndex(
          (a) => a.questionId === answer.questionId
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = answer;
          return updated;
        }
        return [...prev, answer];
      });
    },
    []
  );

  const handleNext = useCallback(() => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setIsProcessing(true);

      setTimeout(() => {
        const profile = buildSkinProfile(answers);
        const recommendation = generateRecommendation(profile);

        const resultsData = {
          profile,
          recommendation,
          completedAt: new Date().toISOString(),
        };

        try {
          sessionStorage.setItem('quizResults', JSON.stringify(resultsData));
        } catch {
          try {
            localStorage.setItem('quizResults', JSON.stringify(resultsData));
          } catch {
            // ignore storage errors
          }
        }

        router.push('/results');
      }, 1500);
    }
  }, [currentQuestion, answers, router]);

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [currentQuestion]);

  const existingAnswer = answers.find(
    (a) => a.questionId === question?.id
  );

  if (isProcessing) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-brand-sand border-t-brand-charcoal rounded-full mx-auto mb-6"
          />
          <h2 className="font-display text-2xl text-brand-charcoal mb-2">
            Analyzing Your Skin Profile
          </h2>
          <p className="text-brand-slate text-sm">
            Checking 71 products for conflicts and compatibility...
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-4 py-8">
      <div className="max-w-xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-brand-slate hover:text-brand-charcoal transition-colors"
          >
            ← Back to Home
          </button>
          <span className="font-display text-lg text-brand-charcoal">
            The Ordinary Answer
          </span>
        </div>
        <ProgressBar
          current={currentQuestion + 1}
          total={quizQuestions.length}
        />
      </div>

      <div className="flex-1 flex items-start justify-center pt-4">
        <AnimatePresence mode="wait">
          {question && (
            <QuestionCard
              key={question.id}
              question={question}
              existingAnswer={existingAnswer}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onBack={handleBack}
              isFirst={currentQuestion === 0}
              isLast={currentQuestion === quizQuestions.length - 1}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
