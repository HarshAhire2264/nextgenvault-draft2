import { useState } from 'react';
import {
  KeyRound, Plus, Search, Lock, Globe, Archive, RotateCcw, XCircle, CheckCircle2,
  Eye, EyeOff, Pencil, FileText, Clock, ShieldCheck, AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { LiabilityRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

function statusBadge(status: LiabilityRecord['status']) {
  if (status === 'open') return <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> Open</Badge>;
  if (status === 'closed') return <Badge tone="neutral"><XCircle className="h-3 w-3" /> Closed</Badge>;
  return <Badge tone="warning"><Archive className="h-3 w-3" /> Archived</Badge>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface LiabilitiesTabProps {
  ownerId: string;
}

export function LiabilitiesTab({ ownerId }: LiabilitiesTabProps) {
  const { liabilities, documents, addLiability, updateLiability, closeLiability, archiveLiability, reopenLiability } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LiabilityRecord['status']>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LiabilityRecord | null>(null);
  const [viewing, setViewing] = useState<LiabilityRecord | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const myLiabilities = liabilities.filter((l) => l.ownerId === ownerId);
  const filtered = myLiabilities.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.username ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const myDocs = documents.filter((d) => d.ownerId === ownerId);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">Password Liabilities</h2>
          <p className="text-sm text-ink-500">Manage your password-based accounts and credentials.</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add liability
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input type="text" placeholder="Search by title or username..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <div className="flex gap-2">
          {(['all', 'open', 'closed', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold capitalize transition ${
                statusFilter === s ? 'bg-brand-700 text-white' : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <KeyRound className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm font-medium text-ink-500">No liabilities found.</p>
          <p className="text-xs text-ink-400">Try adjusting your filters or add a new liability.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((l) => {
            const docCount = myDocs.filter((d) => d.liabilityId === l.id).length;
            return (
              <div key={l.id} className="group rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-900 leading-tight">{l.title}</h3>
                      {l.username && <p className="text-xs text-ink-500">{l.username}</p>}
                    </div>
                  </div>
                  {statusBadge(l.status)}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-3.5 w-3.5 text-ink-400" />
                    <span className="text-ink-500">Password:</span>
                    <code className="flex-1 truncate rounded bg-ink-100 px-2 py-0.5 font-mono text-xs text-ink-700">
                      {showPassword[l.id] ? l.passwordValue : '••••••••••••'}
                    </code>
                    <button onClick={() => setShowPassword((p) => ({ ...p, [l.id]: !p[l.id] }))} className="text-ink-400 hover:text-ink-700">
                      {showPassword[l.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {l.url && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-3.5 w-3.5 text-ink-400" />
                      <a href={l.url} target="_blank" rel="noreferrer" className="truncate text-brand-600 hover:underline">{l.url}</a>
                    </div>
                  )}
                  {docCount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-3.5 w-3.5 text-ink-400" />
                      <span className="text-ink-500">{docCount} document{docCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {l.notes && <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">{l.notes}</p>}

                <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                  <span className="text-xs text-ink-400">Updated {formatDate(l.updatedAt)}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setViewing(l); }} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="View details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setEditing(l); setShowForm(true); }} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    {l.status === 'open' && (
                      <button onClick={() => closeLiability(l.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-amber-50 hover:text-amber-600" title="Close">
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                    {l.status === 'closed' && (
                      <button onClick={() => archiveLiability(l.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Archive">
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                    {(l.status === 'closed' || l.status === 'archived') && (
                      <button onClick={() => reopenLiability(l.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-accent-50 hover:text-accent-600" title="Reopen">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <LiabilityFormModal
          editing={editing}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            if (editing) {
              updateLiability(editing.id, data);
            } else {
              addLiability(data);
            }
            setShowForm(false);
          }}
        />
      )}

      {/* View modal */}
      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={viewing.title} description={`Created ${formatDate(viewing.createdAt)}`} size="md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label-text">Status</p>
                {statusBadge(viewing.status)}
              </div>
              <div>
                <p className="label-text">Type</p>
                <p className="text-sm font-medium text-ink-800 capitalize">{viewing.type}</p>
              </div>
            </div>
            {viewing.username && (
              <div>
                <p className="label-text">Username</p>
                <p className="text-sm text-ink-800">{viewing.username}</p>
              </div>
            )}
            <div>
              <p className="label-text">Password</p>
              <div className="flex items-center gap-2 rounded-lg bg-ink-100 px-3 py-2">
                <code className="flex-1 font-mono text-sm text-ink-800">{showPassword[viewing.id] ? viewing.passwordValue : '••••••••••••'}</code>
                <button onClick={() => setShowPassword((p) => ({ ...p, [viewing.id]: !p[viewing.id] }))} className="text-ink-400 hover:text-ink-700">
                  {showPassword[viewing.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {viewing.url && (
              <div>
                <p className="label-text">URL</p>
                <a href={viewing.url} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">{viewing.url}</a>
              </div>
            )}
            {viewing.notes && (
              <div>
                <p className="label-text">Notes</p>
                <p className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">{viewing.notes}</p>
              </div>
            )}
            <div>
              <p className="label-text">Attached documents</p>
              {myDocs.filter((d) => d.liabilityId === viewing.id).length === 0 ? (
                <p className="text-sm text-ink-400">No documents attached.</p>
              ) : (
                <div className="space-y-2">
                  {myDocs.filter((d) => d.liabilityId === viewing.id).map((d) => (
                    <div key={d.id} className="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2">
                      <FileText className="h-4 w-4 text-ink-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink-800">{d.title}</p>
                        <p className="text-xs text-ink-400">{d.fileName} · {d.fileSize}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LiabilityFormModal({
  editing,
  onClose,
  onSave,
}: {
  editing: LiabilityRecord | null;
  onClose: () => void;
  onSave: (data: Omit<LiabilityRecord, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'status'> & { status?: LiabilityRecord['status'] }) => void;
}) {
  const [title, setTitle] = useState(editing?.title ?? '');
  const [username, setUsername] = useState(editing?.username ?? '');
  const [passwordValue, setPasswordValue] = useState(editing?.passwordValue ?? '');
  const [url, setUrl] = useState(editing?.url ?? '');
  const [notes, setNotes] = useState(editing?.notes ?? '');

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? 'Edit liability' : 'Add password liability'}
      description="Only password-based liabilities are supported."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ title, username, passwordValue, url, notes, type: 'password', category: 'password' })} disabled={!title.trim() || !passwordValue.trim()}>
            {editing ? 'Save changes' : 'Add liability'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label-text">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. Email Account — Gmail" />
        </div>
        <div>
          <label className="label-text">Username / Email</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" placeholder="e.g. user@example.com" />
        </div>
        <div>
          <label className="label-text">Password *</label>
          <input type="text" value={passwordValue} onChange={(e) => setPasswordValue(e.target.value)} className="input-field" placeholder="Enter password" />
        </div>
        <div>
          <label className="label-text">URL (optional)</label>
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="input-field" placeholder="https://..." />
        </div>
        <div>
          <label className="label-text">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="Recovery info, 2FA details, etc." />
        </div>
      </div>
    </Modal>
  );
}

export function LegacyStatusCard({ ownerId }: { ownerId: string }) {
  const { legacyStatus, triggerLegacyActivation, activations, users } = useApp();
  const status = legacyStatus[ownerId] ?? 'inactive';
  const [confirmOpen, setConfirmOpen] = useState(false);

  const ownerActivations = activations.filter((a) => a.ownerId === ownerId);
  const pendingCount = ownerActivations.filter((a) => a.status === 'pending').length;
  const approvedCount = ownerActivations.filter((a) => a.status === 'approved').length;

  const config = {
    inactive: { label: 'Inactive', tone: 'neutral' as const, icon: ShieldCheck, color: 'text-ink-600', bg: 'bg-ink-100', desc: 'Your vault is locked. Beneficiaries cannot access any items.' },
    pending: { label: 'Pending Review', tone: 'warning' as const, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Activation requested. An Admin must approve before beneficiaries gain access.' },
    active: { label: 'Active', tone: 'success' as const, icon: CheckCircle2, color: 'text-accent-600', bg: 'bg-accent-50', desc: 'Legacy is active. Permitted beneficiaries can now access their assigned items.' },
  };
  const c = config[status];
  const Icon = c.icon;

  return (
    <div className={`rounded-2xl border p-5 ${status === 'active' ? 'border-accent-300 bg-accent-50' : status === 'pending' ? 'border-amber-300 bg-amber-50' : 'border-ink-200 bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Legacy Status</p>
            <p className="font-display text-lg font-bold text-ink-900">{c.label}</p>
          </div>
        </div>
        {status === 'inactive' && (
          <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
            <AlertTriangle className="h-3.5 w-3.5" /> Activate
          </Button>
        )}
      </div>
      <p className="mt-3 text-sm text-ink-600">{c.desc}</p>

      {ownerActivations.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-ink-200/60 pt-3">
          {ownerActivations.map((a) => {
            const ben = users.find((u) => u.id === a.beneficiaryId);
            return (
              <div key={a.id} className="flex items-center justify-between text-xs">
                <span className="text-ink-600">{ben?.name ?? 'Unknown'}</span>
                {a.status === 'pending' && <Badge tone="warning">Pending</Badge>}
                {a.status === 'approved' && <Badge tone="success">Approved</Badge>}
                {a.status === 'rejected' && <Badge tone="danger">Rejected</Badge>}
              </div>
            );
          })}
        </div>
      )}
      {pendingCount > 0 && <p className="mt-3 text-xs text-amber-600">{pendingCount} activation request(s) awaiting admin review.</p>}
      {approvedCount > 0 && status === 'active' && <p className="mt-3 text-xs text-accent-600">{approvedCount} beneficiary(ies) now have access to their permitted items.</p>}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Activate Legacy?"
        description="This will notify an Admin to review and approve beneficiary access requests."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { triggerLegacyActivation(ownerId); setConfirmOpen(false); }}>
              Yes, activate legacy
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              Once activated, beneficiaries will only see items you have explicitly permitted — and only after an Admin approves the request.
            </p>
          </div>
          <p className="text-sm text-ink-500">You can track the status of each beneficiary's activation request in this panel.</p>
        </div>
      </Modal>
    </div>
  );
}
