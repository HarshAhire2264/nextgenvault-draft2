import { Shield, Lock, Users, FileCheck, KeyRound, Eye, ArrowRight, CheckCircle2, Server, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';

interface LandingProps {
  onNavigate: (page: 'login' | 'register') => void;
}

export function Landing({ onNavigate }: LandingProps) {
  const { session } = useApp();

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header className="absolute top-0 z-30 w-full">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">Next Gen Vault</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('login')} className="text-white/90 hover:bg-white/10 hover:text-white">
              Sign in
            </Button>
            <Button size="sm" onClick={() => onNavigate('register')} className="bg-white text-brand-800 hover:bg-ink-100">
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-ink-950 pb-24 pt-32">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-500/40 blur-3xl" />
          <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
              <Lock className="h-3.5 w-3.5 text-accent-400" />
              Digital Liability Legacy Management
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Secure your digital legacy.<br />
              <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">Protect your loved ones.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-brand-100">
              Next Gen Vault lets you securely catalog your digital liabilities — passwords, accounts, and credentials — and grant trusted beneficiaries exactly the access you want them to have, only when the time is right.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => onNavigate('register')} className="bg-accent-500 text-white hover:bg-accent-600">
                Start your vault <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="ghost" onClick={() => onNavigate('login')} className="text-white border border-white/20 hover:bg-white/10">
                Sign in
              </Button>
            </div>
            {!session && (
              <p className="mt-6 text-xs text-brand-200">
                Demo accounts — owner@vault.io / owner123 · ben@vault.io / ben123 · admin@vault.io / admin123
              </p>
            )}
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path d="M0,80 C480,0 960,0 1440,80 L1440,80 L0,80 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { icon: Lock, value: '256-bit', label: 'Encryption at rest' },
              { icon: Users, value: '3 Roles', label: 'Owner, Beneficiary, Admin' },
              { icon: FileCheck, value: 'Granular', label: 'Per-item access control' },
              { icon: Clock, value: 'On-demand', label: 'Legacy activation' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="font-display text-2xl font-bold text-ink-900">{stat.value}</p>
                <p className="text-sm text-ink-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">How it works</h2>
            <p className="mt-4 text-lg text-ink-500">Three roles, one secure flow — from vault creation to legacy handover.</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { icon: KeyRound, step: '01', title: 'Owners build their vault', desc: 'Catalog your password-based liabilities and upload related documents. Everything stays encrypted and under your sole control.' },
              { icon: Users, step: '02', title: 'Assign beneficiaries', desc: 'Add trusted people and grant granular, item-level access. Association alone grants nothing — you choose exactly what each person sees.' },
              { icon: Shield, step: '03', title: 'Activate the legacy', desc: 'When the time comes, trigger legacy activation. An Admin reviews and approves the request, and only then do permitted items unlock for each beneficiary.' },
            ].map((item) => (
              <div key={item.step} className="group relative rounded-2xl border border-ink-200 bg-ink-50/50 p-8 transition hover:border-brand-300 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 text-white shadow-md transition group-hover:scale-110">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="absolute right-6 top-6 font-display text-3xl font-bold text-ink-200">{item.step}</span>
                <h3 className="mb-2 font-display text-xl font-bold text-ink-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-ink-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-ink-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Built on trust, designed for control</h2>
            <p className="mt-4 text-lg text-ink-400">Every feature exists to ensure your digital liabilities reach the right hands, securely.</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Lock, title: 'Zero-knowledge vault', desc: 'Your credentials are encrypted and never exposed until you authorize release.' },
              { icon: Eye, title: 'Granular visibility', desc: 'Per-liability and per-document permissions mean beneficiaries see only what you allow.' },
              { icon: FileCheck, title: 'Document safekeeping', desc: 'Upload recovery codes, instructions, and sealed documents alongside each liability.' },
              { icon: Server, title: 'Admin oversight', desc: 'A dedicated Admin role reviews activation requests and manages the platform.' },
              { icon: CheckCircle2, title: 'Verified accounts', desc: 'Identity verification and account status controls keep the ecosystem safe.' },
              { icon: Clock, title: 'Timed activation', desc: 'Legacy status stays inactive until you trigger it and an Admin approves — no accidental exposure.' },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-ink-700 bg-ink-800/50 p-6 transition hover:border-brand-500 hover:bg-ink-800">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-display text-base font-bold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-ink-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-50 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 px-8 py-16 text-center shadow-2xl">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent-500/30 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Ready to secure your digital legacy?</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">Create your vault in minutes and assign trusted beneficiaries today.</p>
              <Button size="lg" onClick={() => onNavigate('register')} className="mt-8 bg-accent-500 text-white hover:bg-accent-600">
                Create your vault <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-700" />
            <span className="font-display text-sm font-bold text-ink-900">Next Gen Vault</span>
          </div>
          <p className="text-sm text-ink-500">A prototype Digital Liability Legacy Management System.</p>
        </div>
      </footer>
    </div>
  );
}
