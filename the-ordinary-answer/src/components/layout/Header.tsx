'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-sand/30"
    >
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-brand-charcoal">
          The Ordinary Answer
        </Link>
        <Link href="/quiz" className="btn-primary text-xs py-2 px-4">
          Take Quiz
        </Link>
      </div>
    </motion.header>
  );
}
