import { useState } from 'react';
import {
  Shield, Users, KeyRound, Clock, CheckCircle2, XCircle, UserCheck, UserX, BadgeCheck,
  Search, AlertCircle, FileText,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { UserRecord, UserStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

type Tab = 'overview' | 'users' | 'activations';

export function AdminDashboard() {
  const { users, liabilities, assignments, activations, legacyStatus, adminUpdateUser, approveActivation, rejectActivation } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'beneficiary' | 'admin'>('all');
  const [actionUser, setActionUser] = useState<UserRecord | null>(null);

  const owners = users.filter((u) => u.role === 'owner');
  const beneficiaries = users.filter((u) => u.role === 'beneficiary');
  const admins = users.filter((u) => u.role === 'admin');
  const pendingActivations = activations.filter((a) => a.status === 'pending');
  const pendingUsers = users.filter((u) => u.status === 'pending_verification');

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const tabs: { id: Tab; label: string; icon: typeof Shield; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activations', label: 'Activations', icon: Clock, badge: pendingActivations.length },
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
            {t.badge ? (
              <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                tab === t.id ? 'bg-white text-brand-700' : 'bg-amber-100 text-amber-700'
              }`}>{t.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total users" value={users.length} sub={`${owners.length} owners · ${beneficiaries.length} beneficiaries · ${admins.length} admins`} tone="brand" />
            <StatCard icon={KeyRound} label="Total liabilities" value={liabilities.length} sub={`${liabilities.filter((l) => l.status === 'open').length} open`} tone="accent" />
            <StatCard icon={Clock} label="Pending activations" value={pendingActivations.length} sub="Awaiting review" tone="warning" />
            <StatCard icon={UserCheck} label="Pending verifications" value={pendingUsers.length} sub="New accounts" tone="neutral" />
          </div>

          {/* Pending activations */}
          <div className="rounded-2xl border border-ink-200 bg-white p-5">
            <h3 className="mb-4 font-display text-lg font-bold text-ink-900">Pending Legacy Activations</h3>
            {pendingActivations.length === 0 ? (
              <p className="text-sm text-ink-400">No pending activation requests.</p>
            ) : (
              <div className="space-y-3">
                {pendingActivations.map((a) => {
                  const owner = users.find((u) => u.id === a.ownerId);
                  const ben = users.find((u) => u.id === a.beneficiaryId);
                  return (
                    <div key={a.id} className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{owner?.name} → {ben?.name}</p>
                          <p className="text-xs text-ink-500">Requested {new Date(a.requestedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => approveActivation(a.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => rejectActivation(a.id)}>
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending verifications */}
          <div className="rounded-2xl border border-ink-200 bg-white p-5">
            <h3 className="mb-4 font-display text-lg font-bold text-ink-900">Pending Verifications</h3>
            {pendingUsers.length === 0 ? (
              <p className="text-sm text-ink-400">No accounts pending verification.</p>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="flex flex-col gap-3 rounded-xl border border-ink-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{u.name}</p>
                        <p className="text-xs text-ink-500">{u.email} · {u.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={() => adminUpdateUser(u.id, { status: 'active', verified: true })}>
                        <BadgeCheck className="h-3.5 w-3.5" /> Verify
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setActionUser(u)}>Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legacy status overview */}
          <div className="rounded-2xl border border-ink-200 bg-white p-5">
            <h3 className="mb-4 font-display text-lg font-bold text-ink-900">Owner Legacy Status</h3>
            <div className="space-y-2">
              {owners.map((o) => {
                const status = legacyStatus[o.id] ?? 'inactive';
                const ownerActivations = activations.filter((a) => a.ownerId === o.id);
                return (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                        {o.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-800">{o.name}</p>
                        <p className="text-xs text-ink-400">{ownerActivations.length} activation requests</p>
                      </div>
                    </div>
                    {status === 'active' ? <Badge tone="success">Active</Badge> : status === 'pending' ? <Badge tone="warning">Pending</Badge> : <Badge tone="neutral">Inactive</Badge>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">User Management</h2>
            <p className="text-sm text-ink-500">Manage all registered users — activate, suspend, or verify accounts.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
            </div>
            <div className="flex gap-2">
              {(['all', 'owner', 'beneficiary', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold capitalize transition ${
                    roleFilter === r ? 'bg-brand-700 text-white' : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-ink-200 bg-ink-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="transition hover:bg-ink-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                            {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-ink-900">{u.name}</p>
                            <p className="text-xs text-ink-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm capitalize text-ink-700">{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <UserStatusBadge status={u.status} verified={u.verified} />
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-500">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {u.status !== 'active' && (
                            <button onClick={() => adminUpdateUser(u.id, { status: 'active' })} className="rounded-lg p-1.5 text-accent-600 hover:bg-accent-50" title="Activate">
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}
                          {u.status === 'active' && (
                            <button onClick={() => adminUpdateUser(u.id, { status: 'suspended' })} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Suspend">
                              <UserX className="h-4 w-4" />
                            </button>
                          )}
                          {!u.verified && (
                            <button onClick={() => adminUpdateUser(u.id, { verified: true, status: 'active' })} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50" title="Verify">
                              <BadgeCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => setActionUser(u)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Details">
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && <p className="py-8 text-center text-sm text-ink-400">No users match your filters.</p>}
          </div>
        </div>
      )}

      {tab === 'activations' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">Legacy Activation Requests</h2>
            <p className="text-sm text-ink-500">Review and approve or reject beneficiary access requests from owners.</p>
          </div>

          {activations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-300 bg-white py-16 text-center">
              <Clock className="mx-auto h-10 w-10 text-ink-300" />
              <p className="mt-3 text-sm font-medium text-ink-500">No activation requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activations.map((a) => {
                const owner = users.find((u) => u.id === a.ownerId);
                const ben = users.find((u) => u.id === a.beneficiaryId);
                const assignment = assignments.find((as) => as.ownerId === a.ownerId && as.beneficiaryId === a.beneficiaryId);
                return (
                  <div key={a.id} className={`rounded-2xl border p-5 ${
                    a.status === 'pending' ? 'border-amber-200 bg-amber-50/50' :
                    a.status === 'approved' ? 'border-accent-200 bg-accent-50/50' :
                    'border-red-200 bg-red-50/50'
                  }`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                          a.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          a.status === 'approved' ? 'bg-accent-100 text-accent-700' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <Shield className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-display text-base font-bold text-ink-900">{owner?.name} → {ben?.name}</h3>
                          <p className="text-xs text-ink-500">Requested {new Date(a.requestedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          {assignment && (
                            <div className="mt-2 flex gap-3 text-xs text-ink-500">
                              <span>{assignment.liabilityAccess.length} liabilities</span>
                              <span>{assignment.documentAccess.length} documents</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.status === 'pending' && (
                          <>
                            <Button size="sm" variant="success" onClick={() => approveActivation(a.id)}>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => rejectActivation(a.id)}>
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}
                        {a.status === 'approved' && <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>}
                        {a.status === 'rejected' && <Badge tone="danger"><XCircle className="h-3 w-3" /> Rejected</Badge>}
                      </div>
                    </div>
                    {a.reviewedAt && (
                      <p className="mt-3 border-t border-ink-200/50 pt-2 text-xs text-ink-400">
                        Reviewed on {new Date(a.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* User detail modal */}
      {actionUser && (
        <Modal
          open
          onClose={() => setActionUser(null)}
          title={actionUser.name}
          description={actionUser.email}
          size="md"
          footer={<Button variant="outline" onClick={() => setActionUser(null)}>Close</Button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label-text">Role</p>
                <p className="text-sm font-medium capitalize text-ink-800">{actionUser.role}</p>
              </div>
              <div>
                <p className="label-text">Status</p>
                <UserStatusBadge status={actionUser.status} verified={actionUser.verified} />
              </div>
              <div>
                <p className="label-text">Verified</p>
                <p className="text-sm font-medium text-ink-800">{actionUser.verified ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="label-text">Joined</p>
                <p className="text-sm font-medium text-ink-800">{new Date(actionUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-ink-100 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Quick actions</p>
              <div className="flex flex-wrap gap-2">
                {actionUser.status !== 'active' && (
                  <Button size="sm" variant="success" onClick={() => { adminUpdateUser(actionUser.id, { status: 'active' }); setActionUser(null); }}>
                    <UserCheck className="h-3.5 w-3.5" /> Activate
                  </Button>
                )}
                {actionUser.status === 'active' && (
                  <Button size="sm" variant="danger" onClick={() => { adminUpdateUser(actionUser.id, { status: 'suspended' }); setActionUser(null); }}>
                    <UserX className="h-3.5 w-3.5" /> Suspend
                  </Button>
                )}
                {!actionUser.verified && (
                  <Button size="sm" variant="primary" onClick={() => { adminUpdateUser(actionUser.id, { verified: true, status: 'active' }); setActionUser(null); }}>
                    <BadgeCheck className="h-3.5 w-3.5" /> Verify account
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">Suspending an account prevents the user from signing in. Verification marks the account as trusted.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function UserStatusBadge({ status, verified }: { status: UserStatus; verified: boolean }) {
  if (status === 'active' && verified) return <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> Active</Badge>;
  if (status === 'active') return <Badge tone="brand">Active</Badge>;
  if (status === 'suspended') return <Badge tone="danger"><UserX className="h-3 w-3" /> Suspended</Badge>;
  return <Badge tone="warning"><Clock className="h-3 w-3" /> Pending verification</Badge>;
}

function StatCard({ icon: Icon, label, value, sub, tone }: { icon: typeof Shield; label: string; value: string | number; sub: string; tone: 'brand' | 'accent' | 'warning' | 'neutral' }) {
  const colors = {
    brand: 'bg-brand-100 text-brand-700',
    accent: 'bg-accent-100 text-accent-700',
    warning: 'bg-amber-100 text-amber-700',
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
