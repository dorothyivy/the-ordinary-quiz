'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/ui/ProductCard';
import { ConflictWarnings } from '@/components/ui/ConflictWarnings';
import { EmailCapture } from '@/components/ui/EmailCapture';
import type { SkinProfile, RoutineRecommendation } from '@/types';

interface ResultsData {
  profile: SkinProfile;
  recommendation: RoutineRecommendation;
  completedAt: string;
}

function ResultsContent() {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening' | 'weekly'>('morning');
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem('quizResults') ||
        localStorage.getItem('quizResults');
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-sand border-t-brand-charcoal rounded-full animate-spin" />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl text-brand-charcoal mb-4">
            Results Not Found
          </h1>
          <p className="text-brand-slate mb-6">
            It looks like your quiz results have expired or the link is invalid.
          </p>
          <Link href="/quiz" className="btn-primary">
            Take the Quiz Again
          </Link>
        </div>
      </main>
    );
  }

  const { profile, recommendation } = data;

  const tabs = [
    { id: 'morning' as const, label: 'Morning', icon: '☀️', count: recommendation.morning.length },
    { id: 'evening' as const, label: 'Evening', icon: '🌙', count: recommendation.evening.length },
    { id: 'weekly' as const, label: 'Weekly', icon: '📅', count: recommendation.weekly.length },
  ];

  const activeProducts =
    activeTab === 'morning'
      ? recommendation.morning
      : activeTab === 'evening'
      ? recommendation.evening
      : recommendation.weekly;

  const handleEmailSubmit = async (emailData: {
    email: string;
    phone?: string;
    firstName?: string;
  }) => {
    try {
      await fetch('/api/klaviyo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...emailData,
          skinProfile: profile,
          recommendation,
          quizCompletedAt: data.completedAt,
        }),
      });
    } catch (error) {
      console.error('Failed to submit to Klaviyo:', error);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link
            href="/"
            className="text-sm text-brand-slate hover:text-brand-charcoal transition-colors"
          >
            ← The Ordinary Answer
          </Link>
          <h1 className="font-display text-4xl md:text-5xl text-brand-charcoal mt-4 mb-3">
            Your Personalized Routine
          </h1>
          <p className="text-brand-graphite">
            Built for{' '}
            <span className="font-medium">{profile.skinType} skin</span> ·{' '}
            <span className="font-medium capitalize">{profile.experience}</span>{' '}
            level ·{' '}
            <span className="font-medium capitalize">{profile.climate}</span>{' '}
            climate
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="quiz-card mb-8"
        >
          <h2 className="font-display text-xl text-brand-charcoal mb-4">
            Your Skin Profile
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-slate">Skin Type</span>
              <p className="font-medium capitalize text-brand-charcoal">{profile.skinType}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-slate">Age</span>
              <p className="font-medium text-brand-charcoal">{profile.age}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-slate">Experience</span>
              <p className="font-medium capitalize text-brand-charcoal">{profile.experience}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-slate">Total Cost</span>
              <p className="font-medium text-brand-coral text-lg">{formatPrice(recommendation.totalCost)}</p>
            </div>
          </div>

          {profile.concerns.length > 0 && (
            <div className="mt-4 pt-4 border-t border-brand-sand/30">
              <span className="text-xs uppercase tracking-wider text-brand-slate">Concerns</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.concerns.map((concern) => (
                  <span
                    key={concern}
                    className="px-3 py-1 rounded-full bg-brand-blush/15 text-xs font-medium text-brand-graphite capitalize"
                  >
                    {concern.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {recommendation.conflictWarnings.length > 0 && (
          <div className="mb-8">
            <ConflictWarnings warnings={recommendation.conflictWarnings} />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-brand-sand/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-brand-charcoal text-white shadow-sm'
                    : 'text-brand-slate hover:text-brand-charcoal hover:bg-brand-cream/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-brand-sand/50'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4 mb-10">
          {activeProducts.length > 0 ? (
            activeProducts.map((item, index) => (
              <ProductCard key={item.product.id} item={item} index={index} />
            ))
          ) : (
            <div className="quiz-card text-center py-10">
              <p className="text-brand-slate">No products recommended for this routine segment.</p>
            </div>
          )}
        </div>

        <div className="mb-10">
          <EmailCapture onSubmit={handleEmailSubmit} />
        </div>

        <div className="text-center">
          <Link href="/quiz" className="btn-secondary">
            Retake Quiz
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-sand border-t-brand-charcoal rounded-full animate-spin" />
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
