import { useState } from 'react';
import { Shield, Mail, Lock, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';

interface AuthPageProps {
  mode: 'login' | 'register';
  onNavigate: (page: 'login' | 'register' | 'landing') => void;
}

const demoAccounts = [
  { label: 'Owner', email: 'owner@vault.io', password: 'owner123' },
  { label: 'Beneficiary', email: 'ben@vault.io', password: 'ben123' },
  { label: 'Admin', email: 'admin@vault.io', password: 'admin123' },
];

export function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { login, register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'beneficiary' | 'admin'>('owner');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === 'login';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isLogin) {
      const result = login(email, password);
      if (!result.ok) setError(result.error ?? 'Login failed.');
    } else {
      if (!name.trim()) { setError('Please enter your name.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      const result = register(name, email, password, role);
      if (!result.ok) setError(result.error ?? 'Registration failed.');
    }
  };

  const fillDemo = (demo: typeof demoAccounts[number]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50 lg:flex-row">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-ink-950 lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-500/40 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">Next Gen Vault</span>
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Your digital legacy,<br />securely preserved.
          </h2>
          <p className="mt-4 max-w-md text-lg text-brand-100">
            Catalog your digital liabilities, assign trusted beneficiaries, and control exactly what they can access — only when the time is right.
          </p>
          <div className="mt-8 space-y-3">
            {['Granular, per-item access control', 'Admin-reviewed legacy activation', 'Encrypted document vault'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-brand-100">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500/30">
                  <Shield className="h-3 w-3 text-accent-300" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-brand-200">© 2025 Next Gen Vault. A prototype system.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <button onClick={() => onNavigate('landing')} className="mb-8 flex items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </button>

          <div className="lg:hidden mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-md">
              <Shield className="h-6 w-6" />
            </div>
            <span className="font-display text-xl font-bold text-ink-900">Next Gen Vault</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-ink-900">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {isLogin ? 'Sign in to access your vault.' : 'Start securing your digital legacy today.'}
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <div>
                <label className="label-text">Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Jane Doe" />
              </div>
            )}
            <div>
              <label className="label-text">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="label-text">I am a...</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'owner', label: 'Owner' },
                    { value: 'beneficiary', label: 'Beneficiary' },
                    { value: 'admin', label: 'Admin' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                        role === opt.value
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-ink-300 bg-white text-ink-600 hover:border-ink-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full">
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink-200" /></div>
                <div className="relative flex justify-center"><span className="bg-ink-50 px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Demo accounts</span></div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {demoAccounts.map((demo) => (
                  <button
                    key={demo.label}
                    onClick={() => fillDemo(demo)}
                    className="rounded-lg border border-ink-200 bg-white px-2 py-2.5 text-center transition hover:border-brand-400 hover:bg-brand-50"
                  >
                    <p className="text-xs font-bold text-ink-800">{demo.label}</p>
                    <p className="mt-0.5 truncate text-[10px] text-ink-400">{demo.email}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-ink-500">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => onNavigate(isLogin ? 'register' : 'login')} className="font-semibold text-brand-700 hover:text-brand-800">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
