import { useState } from 'react';
import { KeyRound, Users, FileText, LayoutDashboard } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LiabilitiesTab, LegacyStatusCard } from '@/pages/owner/LiabilitiesTab';
import { BeneficiariesTab } from '@/pages/owner/BeneficiariesTab';
import { DocumentsTab } from '@/pages/owner/DocumentsTab';

type Tab = 'overview' | 'liabilities' | 'beneficiaries' | 'documents';

export function OwnerDashboard() {
  const { session, liabilities, documents, assignments, users, legacyStatus } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const ownerId = session!.user.id;

  const myLiabilities = liabilities.filter((l) => l.ownerId === ownerId);
  const myDocs = documents.filter((d) => d.ownerId === ownerId);
  const myAssignments = assignments.filter((a) => a.ownerId === ownerId);
  const status = legacyStatus[ownerId] ?? 'inactive';

  const tabs: { id: Tab; label: string; icon: typeof KeyRound }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'liabilities', label: 'Liabilities', icon: KeyRound },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-ink-200 bg-white p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap ${
              tab === t.id ? 'bg-brand-700 text-white shadow-sm' : 'text-ink-600 hover:bg-ink-100'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Stats */}
          <div className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard icon={KeyRound} label="Total liabilities" value={myLiabilities.length} sub={`${myLiabilities.filter((l) => l.status === 'open').length} open`} tone="brand" />
              <StatCard icon={Users} label="Beneficiaries" value={myAssignments.length} sub={`${myAssignments.reduce((acc, a) => acc + a.liabilityAccess.length, 0)} access grants`} tone="accent" />
              <StatCard icon={FileText} label="Documents" value={myDocs.length} sub={`${myDocs.filter((d) => d.fileType === 'pdf').length} PDFs`} tone="brand" />
              <StatCard icon={LayoutDashboard} label="Legacy status" value={status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Inactive'} sub={status === 'active' ? 'Unlocked' : 'Locked'} tone={status === 'active' ? 'accent' : 'neutral'} />
            </div>

            <div className="mt-6">
              <h3 className="mb-3 font-display text-lg font-bold text-ink-900">Recent liabilities</h3>
              <div className="space-y-2">
                {myLiabilities.slice(0, 5).map((l) => (
                  <div key={l.id} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-900">{l.title}</p>
                      <p className="text-xs text-ink-500">{l.username ?? 'No username'}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      l.status === 'open' ? 'bg-accent-100 text-accent-800' : l.status === 'closed' ? 'bg-ink-100 text-ink-600' : 'bg-amber-100 text-amber-700'
                    }`}>{l.status}</span>
                  </div>
                ))}
                {myLiabilities.length === 0 && <p className="text-sm text-ink-400">No liabilities yet.</p>}
              </div>
            </div>
          </div>

          {/* Legacy status */}
          <div>
            <LegacyStatusCard ownerId={ownerId} />
            <div className="mt-4 rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 font-display text-base font-bold text-ink-900">Assigned beneficiaries</h3>
              {myAssignments.length === 0 ? (
                <p className="text-sm text-ink-400">No beneficiaries assigned.</p>
              ) : (
                <div className="space-y-2">
                  {myAssignments.map((a) => {
                    const ben = users.find((u) => u.id === a.beneficiaryId);
                    return (
                      <div key={a.id} className="flex items-center gap-3 rounded-lg bg-ink-50 px-3 py-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {ben?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink-800">{ben?.name}</p>
                          <p className="text-xs text-ink-400">{a.liabilityAccess.length} liabilities · {a.documentAccess.length} docs</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'liabilities' && <LiabilitiesTab ownerId={ownerId} />}
      {tab === 'beneficiaries' && <BeneficiariesTab ownerId={ownerId} />}
      {tab === 'documents' && <DocumentsTab ownerId={ownerId} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone }: { icon: typeof KeyRound; label: string; value: string | number; sub: string; tone: 'brand' | 'accent' | 'neutral' }) {
  const colors = {
    brand: 'bg-brand-100 text-brand-700',
    accent: 'bg-accent-100 text-accent-700',
    neutral: 'bg-ink-100 text-ink-700',
  };
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
          <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-400">{sub}</p>
    </div>
  );
}
