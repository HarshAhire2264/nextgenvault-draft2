import { useState } from 'react';
import { ChevronDown, LogOut, Shield, User, Users, Vault, Menu, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Role } from '@/types';
import { Button } from '@/components/ui/Button';

const roleConfig: { role: Role; label: string; icon: typeof Shield }[] = [
  { role: 'owner', label: 'Owner', icon: Vault },
  { role: 'beneficiary', label: 'Beneficiary', icon: Users },
  { role: 'admin', label: 'Admin', icon: Shield },
];

export function Navbar() {
  const { session, activeRole, switchRole, logout } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session) return null;

  const currentRole = roleConfig.find((r) => r.role === activeRole) ?? roleConfig[0];
  const CurrentIcon = currentRole.icon;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold leading-tight text-ink-900">Next Gen Vault</p>
            <p className="text-xs text-ink-500">Legacy Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              <CurrentIcon className="h-4 w-4 text-brand-600" />
              <span className="hidden sm:inline">{currentRole.label} View</span>
              <ChevronDown className={`h-4 w-4 text-ink-400 transition ${roleMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {roleMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRoleMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl animate-slide-down">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Switch role view
                  </div>
                  {roleConfig.map(({ role, label, icon: Icon }) => (
                    <button
                      key={role}
                      onClick={() => { switchRole(role); setRoleMenuOpen(false); }}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition ${
                        activeRole === role ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-700 hover:bg-ink-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                      {activeRole === role && <span className="ml-auto text-xs">●</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <User className="h-4 w-4" />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight text-ink-900">{session.user.name}</p>
              <p className="text-xs text-ink-500">{session.user.email}</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={logout} className="text-ink-500">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>

          <button className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
