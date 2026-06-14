import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BarChart3,
  MessageCircle,
  Target,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';
import { LandingNav } from '@/components/shared/LandingNav';

export const metadata: Metadata = {
  title: 'CarbonDetox — AI Sustainability Coach for India',
  description:
    "Detox your lifestyle with AI-powered carbon health scores and personalised daily missions. Built for India's 1.4 billion people.",
};

const FEATURES = [
  {
    icon: BarChart3,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    title: 'Your Carbon Health Score',
    description:
      'A personalised 0–100 score across transport, food, energy, shopping, and waste — tailored to your Indian lifestyle.',
  },
  {
    icon: MessageCircle,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    title: 'AI Coach',
    description:
      'Chat with your sustainability mentor powered by Gemini 2.5 Flash. Get practical tips in Indian context — from metros to tiffin boxes.',
  },
  {
    icon: Target,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    title: 'Daily Eco-Missions',
    description:
      'Three achievable missions generated fresh every day based on your weakest category. Complete them, earn XP, build streaks.',
  },
];

const STATS = [
  { value: '1.4B', label: 'People. One planet.' },
  { value: '7%', label: "India's share of global CO\u2082" },
  { value: '100', label: 'Points. Your score to beat.' },
  { value: '3×', label: 'Daily missions to improve' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <LandingNav />

      <main>
        {/* Hero */}
        <section
          className="relative pt-32 pb-24 px-6 text-center overflow-hidden"
          aria-labelledby="hero-heading"
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(22,163,74,0.15) 0%, transparent 60%)',
            }}
          />

          <div className="relative max-w-4xl mx-auto stagger-children">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-sm font-medium"
              style={{
                background: 'rgba(22,163,74,0.1)',
                borderColor: 'rgba(22,163,74,0.3)',
                color: 'var(--color-forest-light)',
              }}
            >
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              Powered by Gemini 2.5 Flash
            </div>

            <h1 id="hero-heading" className="mb-6">
              Detox your lifestyle,{' '}
              <span className="gradient-text">one habit at a time.</span>
            </h1>

            <p
              className="text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              CarbonDetox gives you a personalised carbon health score and daily
              eco-missions — not just a calculator, but an AI coach that understands
              Indian cities, diets, and commutes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-forest), var(--color-forest-dark))',
                  color: 'white',
                  boxShadow: 'var(--shadow-glow-green)',
                }}
              >
                Start with Google
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="/login?guest=true"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border transition-all hover:scale-[1.02]"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                Try as Guest
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section
          className="py-12 px-6 border-y"
          style={{ borderColor: 'var(--color-border)' }}
          aria-label="Key facts"
        >
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold gradient-text mb-1">{value}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto">
            <h2 id="features-heading" className="text-center mb-4">
              Everything you need to <span className="gradient-text">go greener</span>
            </h2>
            <p
              className="text-center text-lg mb-16 max-w-2xl mx-auto"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Built for the realities of Indian life — from auto-rickshaws to Swiggy
              orders.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, color, bg, title, description }) => (
                <article
                  key={title}
                  className="glass-card p-6 space-y-4 group hover:scale-[1.01] transition-transform"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: bg }}
                    aria-hidden="true"
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trust section */}
        <section
          className="py-16 px-6 border-t"
          style={{ borderColor: 'var(--color-border)' }}
          aria-label="Trust and security"
        >
          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, label: 'Private by design', sub: 'Your data never sold' },
              {
                icon: Globe,
                label: 'India-first context',
                sub: 'Local cities, diets, habits',
              },
              { icon: Zap, label: 'AI-powered insights', sub: 'Gemini 2.5 Flash' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                  style={{ background: 'rgba(22,163,74,0.1)' }}
                  aria-hidden="true"
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: 'var(--color-forest-light)' }}
                  />
                </div>
                <p className="font-semibold">{label}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Bottom */}
        <section className="py-24 px-6 text-center" aria-label="Get started">
          <div className="max-w-2xl mx-auto">
            <h2 className="mb-4">Ready to know your score?</h2>
            <p className="text-lg mb-8" style={{ color: 'var(--color-text-muted)' }}>
              Takes 2 minutes. No credit card. No judgment — just a plan to do better.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-forest), var(--color-forest-dark))',
                color: 'white',
                boxShadow: 'var(--shadow-glow-green)',
              }}
            >
              Get my Carbon Score
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="px-6 py-8 border-t text-center text-sm"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <p>
          Built with 🌿 for{' '}
          <strong style={{ color: 'var(--color-text-secondary)' }}>
            Hack2Skill PromptWars
          </strong>{' '}
          — CarbonDetox {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
