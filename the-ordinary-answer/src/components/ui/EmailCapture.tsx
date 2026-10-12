'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailCaptureProps {
  onSubmit: (data: { email: string; phone?: string; firstName?: string }) => void;
}

export function EmailCapture({ onSubmit }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    onSubmit({ email, phone: phone || undefined, firstName: firstName || undefined });
    setIsSubmitted(true);
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-brand-sage/10 border border-brand-sage/30 p-6 text-center"
      >
        <div className="text-3xl mb-3">✉️</div>
        <h3 className="font-display text-lg text-brand-charcoal mb-1">
          Routine Saved!
        </h3>
        <p className="text-sm text-brand-slate">
          Check your inbox for your complete routine guide with tips and
          application order.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-brand-sand/50 p-6"
    >
      <h3 className="font-display text-xl text-brand-charcoal mb-1">
        Save Your Routine
      </h3>
      <p className="text-sm text-brand-slate mb-4">
        Get your personalized routine emailed to you with detailed instructions
        and a shopping list.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="First name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-brand-sand bg-brand-cream/30 text-sm text-brand-charcoal placeholder:text-brand-slate/50 focus:outline-none focus:ring-2 focus:ring-brand-charcoal/20 focus:border-brand-charcoal/30 transition-all"
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="Email address *"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-brand-sand bg-brand-cream/30 text-sm text-brand-charcoal placeholder:text-brand-slate/50 focus:outline-none focus:ring-2 focus:ring-brand-charcoal/20 focus:border-brand-charcoal/30 transition-all"
          />
        </div>

        <AnimatePresence>
          {showPhone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                type="tel"
                placeholder="Phone number (for SMS tips)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brand-sand bg-brand-cream/30 text-sm text-brand-charcoal placeholder:text-brand-slate/50 focus:outline-none focus:ring-2 focus:ring-brand-charcoal/20 focus:border-brand-charcoal/30 transition-all"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!showPhone && (
          <button
            type="button"
            onClick={() => setShowPhone(true)}
            className="text-xs text-brand-slate hover:text-brand-charcoal transition-colors"
          >
            + Add phone for SMS skincare tips
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !email}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            'Email My Routine'
          )}
        </button>

        <p className="text-[10px] text-brand-slate/60 text-center">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </form>
    </motion.div>
  );
}
