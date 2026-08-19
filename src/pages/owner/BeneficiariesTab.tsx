import { useState } from 'react';
import { Users, Plus, Search, Trash2, Pencil, KeyRound, FileText, Check, X, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { BeneficiaryAssignment } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface BeneficiariesTabProps {
  ownerId: string;
}

export function BeneficiariesTab({ ownerId }: BeneficiariesTabProps) {
  const { users, liabilities, documents, assignments, addBeneficiary, updateBeneficiaryAccess, removeBeneficiary } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<BeneficiaryAssignment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const myAssignments = assignments.filter((a) => a.ownerId === ownerId);
  const myLiabilities = liabilities.filter((l) => l.ownerId === ownerId && l.status !== 'archived');
  const myDocuments = documents.filter((d) => d.ownerId === ownerId);

  const availableBeneficiaries = users.filter((u) => u.role === 'beneficiary');

  const filteredAssignments = myAssignments.filter((a) => {
    const ben = users.find((u) => u.id === a.beneficiaryId);
    return ben && ben.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">Beneficiaries</h2>
          <p className="text-sm text-ink-500">Assign trusted people and control what they can access.</p>
        </div>
        <Button onClick={() => { setError(null); setShowAdd(true); }}>
          <Plus className="h-4 w-4" /> Add beneficiary
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input type="text" placeholder="Search beneficiaries..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm font-medium text-ink-500">No beneficiaries assigned yet.</p>
          <p className="text-xs text-ink-400">Add a beneficiary to start granting access.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((a) => {
            const ben = users.find((u) => u.id === a.beneficiaryId);
            if (!ben) return null;
            return (
              <div key={a.id} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold">
                      {ben.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-900">{ben.name}</h3>
                      <p className="text-xs text-ink-500">{ben.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditing(a); }} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Edit access">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeBeneficiary(a.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600" title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Liability access ({a.liabilityAccess.length})
                    </p>
                    {a.liabilityAccess.length === 0 ? (
                      <p className="text-xs text-ink-400">No liabilities granted.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {a.liabilityAccess.map((lid) => {
                          const liab = myLiabilities.find((l) => l.id === lid);
                          return (
                            <div key={lid} className="flex items-center gap-2 rounded-lg bg-ink-50 px-2.5 py-1.5 text-xs">
                              <KeyRound className="h-3 w-3 text-brand-500" />
                              <span className="truncate text-ink-700">{liab?.title ?? 'Unknown'}</span>
                              <Check className="ml-auto h-3 w-3 text-accent-500" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Document access ({a.documentAccess.length})
                    </p>
                    {a.documentAccess.length === 0 ? (
                      <p className="text-xs text-ink-400">No documents granted.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {a.documentAccess.map((did) => {
                          const doc = myDocuments.find((d) => d.id === did);
                          return (
                            <div key={did} className="flex items-center gap-2 rounded-lg bg-ink-50 px-2.5 py-1.5 text-xs">
                              <FileText className="h-3 w-3 text-brand-500" />
                              <span className="truncate text-ink-700">{doc?.title ?? 'Unknown'}</span>
                              <Check className="ml-auto h-3 w-3 text-accent-500" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-ink-400" />
                  <p className="text-xs text-ink-500">
                    Access is enforced per-item. Association alone does not grant access.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <BeneficiaryAccessModal
          title="Add Beneficiary"
          description="Select a beneficiary and grant granular access."
          beneficiaries={availableBeneficiaries}
          liabilities={myLiabilities}
          documents={myDocuments}
          initialBeneficiaryId=""
          initialLiabilityAccess={[]}
          initialDocumentAccess={[]}
          error={error}
          onClose={() => setShowAdd(false)}
          onSubmit={(benId, liabAccess, docAccess) => {
            const result = addBeneficiary(benId, liabAccess, docAccess);
            if (!result.ok) {
              setError(result.error ?? 'Failed to add beneficiary.');
            } else {
              setShowAdd(false);
            }
          }}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <BeneficiaryAccessModal
          title="Edit Access Permissions"
          description="Update what this beneficiary can access."
          beneficiaries={availableBeneficiaries.filter((u) => u.id === editing.beneficiaryId)}
          liabilities={myLiabilities}
          documents={myDocuments}
          initialBeneficiaryId={editing.beneficiaryId}
          initialLiabilityAccess={editing.liabilityAccess}
          initialDocumentAccess={editing.documentAccess}
          error={null}
          onClose={() => setEditing(null)}
          onSubmit={(_benId, liabAccess, docAccess) => {
            updateBeneficiaryAccess(editing.id, liabAccess, docAccess);
            setEditing(null);
          }}
          isEdit
        />
      )}
    </div>
  );
}

function BeneficiaryAccessModal({
  title,
  description,
  beneficiaries,
  liabilities,
  documents,
  initialBeneficiaryId,
  initialLiabilityAccess,
  initialDocumentAccess,
  error,
  onClose,
  onSubmit,
  isEdit = false,
}: {
  title: string;
  description: string;
  beneficiaries: { id: string; name: string; email: string }[];
  liabilities: { id: string; title: string }[];
  documents: { id: string; title: string }[];
  initialBeneficiaryId: string;
  initialLiabilityAccess: string[];
  initialDocumentAccess: string[];
  error: string | null;
  onClose: () => void;
  onSubmit: (beneficiaryId: string, liabilityAccess: string[], documentAccess: string[]) => void;
  isEdit?: boolean;
}) {
  const [beneficiaryId, setBeneficiaryId] = useState(initialBeneficiaryId);
  const [liabilityAccess, setLiabilityAccess] = useState<string[]>(initialLiabilityAccess);
  const [documentAccess, setDocumentAccess] = useState<string[]>(initialDocumentAccess);

  const toggle = (list: string[], id: string, setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      description={description}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(beneficiaryId, liabilityAccess, documentAccess)} disabled={!beneficiaryId}>
            {isEdit ? 'Save changes' : 'Add beneficiary'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!isEdit && (
          <div>
            <label className="label-text">Select beneficiary</label>
            <select value={beneficiaryId} onChange={(e) => setBeneficiaryId(e.target.value)} className="input-field">
              <option value="">Choose a beneficiary...</option>
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.email})</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label-text">Liability access</label>
          {liabilities.length === 0 ? (
            <p className="text-sm text-ink-400">No active liabilities available.</p>
          ) : (
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {liabilities.map((l) => (
                <label key={l.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink-200 px-3 py-2 transition hover:bg-ink-50">
                  <input
                    type="checkbox"
                    checked={liabilityAccess.includes(l.id)}
                    onChange={() => toggle(liabilityAccess, l.id, setLiabilityAccess)}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  />
                  <KeyRound className="h-4 w-4 text-ink-400" />
                  <span className="text-sm text-ink-700">{l.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label-text">Document access</label>
          {documents.length === 0 ? (
            <p className="text-sm text-ink-400">No documents available.</p>
          ) : (
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {documents.map((d) => (
                <label key={d.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink-200 px-3 py-2 transition hover:bg-ink-50">
                  <input
                    type="checkbox"
                    checked={documentAccess.includes(d.id)}
                    onChange={() => toggle(documentAccess, d.id, setDocumentAccess)}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  />
                  <FileText className="h-4 w-4 text-ink-400" />
                  <span className="text-sm text-ink-700">{d.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-xs text-brand-700">
            Only the items you select here will be visible to this beneficiary — and only after legacy activation is approved by an Admin.
          </p>
        </div>
      </div>
    </Modal>
  );
}
