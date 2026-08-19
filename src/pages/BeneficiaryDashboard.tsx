import { useState } from 'react';
import {
  Lock, KeyRound, FileText, Eye, EyeOff, Download, ShieldCheck, Clock, Users, AlertCircle, ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function BeneficiaryDashboard() {
  const { session, users, liabilities, documents, assignments, legacyStatus, activations } = useApp();
  const benId = session!.user.id;
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  const myAssignments = assignments.filter((a) => a.beneficiaryId === benId);

  const getOwnerStatus = (ownerId: string) => legacyStatus[ownerId] ?? 'inactive';
  const getActivation = (ownerId: string) => activations.find((a) => a.ownerId === ownerId && a.beneficiaryId === benId);

  const selectedAssignment = selectedOwner ? myAssignments.find((a) => a.ownerId === selectedOwner) : null;
  const selectedOwnerUser = selectedOwner ? users.find((u) => u.id === selectedOwner) : null;
  const selectedStatus = selectedOwner ? getOwnerStatus(selectedOwner) : 'inactive';
  const selectedActivation = selectedOwner ? getActivation(selectedOwner) : null;

  const accessibleLiabilities = selectedAssignment
    ? liabilities.filter((l) => selectedAssignment.liabilityAccess.includes(l.id))
    : [];
  const accessibleDocuments = selectedAssignment
    ? documents.filter((d) => selectedAssignment.documentAccess.includes(d.id))
    : [];

  const isUnlocked = selectedStatus === 'active' && selectedActivation?.status === 'approved';

  const viewingDocRecord = viewingDoc ? accessibleDocuments.find((d) => d.id === viewingDoc) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">My Inheritance Portal</h1>
        <p className="text-sm text-ink-500">View the liabilities and documents assigned to you by your owners.</p>
      </div>

      {myAssignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm font-medium text-ink-500">No owners have assigned you yet.</p>
          <p className="text-xs text-ink-400">Once an owner adds you as a beneficiary, you'll see them here.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Owners list */}
          <div className="lg:col-span-1">
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">Assigned Owners</h2>
            <div className="space-y-2">
              {myAssignments.map((a) => {
                const owner = users.find((u) => u.id === a.ownerId);
                if (!owner) return null;
                const status = getOwnerStatus(a.ownerId);
                const activation = getActivation(a.ownerId);
                const isActive = status === 'active' && activation?.status === 'approved';
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedOwner(a.ownerId)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                      selectedOwner === a.ownerId ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold">
                      {owner.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-900">{owner.name}</p>
                      <p className="text-xs text-ink-500">{a.liabilityAccess.length} liabilities · {a.documentAccess.length} docs</p>
                    </div>
                    {isActive ? (
                      <Badge tone="success">Unlocked</Badge>
                    ) : status === 'pending' ? (
                      <Badge tone="warning">Pending</Badge>
                    ) : (
                      <Badge tone="neutral">Locked</Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-ink-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            {!selectedOwner || !selectedAssignment || !selectedOwnerUser ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-white text-center">
                <ShieldCheck className="h-12 w-12 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-500">Select an owner to view your assigned items.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Owner header */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold">
                        {selectedOwnerUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink-900">{selectedOwnerUser.name}</h3>
                        <p className="text-xs text-ink-500">{selectedOwnerUser.email}</p>
                      </div>
                    </div>
                    {isUnlocked ? (
                      <Badge tone="success"><ShieldCheck className="h-3 w-3" /> Access Unlocked</Badge>
                    ) : selectedStatus === 'pending' ? (
                      <Badge tone="warning"><Clock className="h-3 w-3" /> Pending Admin Approval</Badge>
                    ) : (
                      <Badge tone="neutral"><Lock className="h-3 w-3" /> Legacy Locked</Badge>
                    )}
                  </div>
                </div>

                {/* Locked state */}
                {!isUnlocked && (
                  <div className="rounded-2xl border border-ink-200 bg-ink-50 p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-200 text-ink-500">
                      <Lock className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-ink-800">
                      {selectedStatus === 'pending' ? 'Awaiting Admin approval' : 'Legacy not activated'}
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
                      {selectedStatus === 'pending'
                        ? 'The owner has triggered legacy activation. An Admin must approve the request before you can access your assigned items.'
                        : 'The owner has not yet activated their legacy. You can see what has been assigned to you, but contents remain locked until activation and approval.'}
                    </p>
                    <div className="mx-auto mt-6 max-w-md space-y-2">
                      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm">
                        <span className="text-ink-500">Assigned liabilities</span>
                        <span className="font-semibold text-ink-800">{accessibleLiabilities.length}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm">
                        <span className="text-ink-500">Assigned documents</span>
                        <span className="font-semibold text-ink-800">{accessibleDocuments.length}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unlocked content */}
                {isUnlocked && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Liabilities */}
                    <div>
                      <h3 className="mb-3 font-display text-lg font-bold text-ink-900">Permitted Liabilities</h3>
                      {accessibleLiabilities.length === 0 ? (
                        <p className="text-sm text-ink-400">No liabilities have been unlocked for you.</p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {accessibleLiabilities.map((l) => (
                            <div key={l.id} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                                  <KeyRound className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-ink-900">{l.title}</h4>
                                  {l.username && <p className="text-xs text-ink-500">{l.username}</p>}
                                </div>
                              </div>
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Lock className="h-3.5 w-3.5 text-ink-400" />
                                  <code className="flex-1 truncate rounded bg-ink-100 px-2 py-0.5 font-mono text-xs text-ink-700">
                                    {showPassword[l.id] ? l.passwordValue : '••••••••••••'}
                                  </code>
                                  <button onClick={() => setShowPassword((p) => ({ ...p, [l.id]: !p[l.id] }))} className="text-ink-400 hover:text-ink-700">
                                    {showPassword[l.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                                {l.url && (
                                  <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-brand-600 hover:underline">
                                    <KeyRound className="h-3 w-3" /> {l.url}
                                  </a>
                                )}
                              </div>
                              {l.notes && <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">{l.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    <div>
                      <h3 className="mb-3 font-display text-lg font-bold text-ink-900">Permitted Documents</h3>
                      {accessibleDocuments.length === 0 ? (
                        <p className="text-sm text-ink-400">No documents have been unlocked for you.</p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {accessibleDocuments.map((d) => (
                            <div key={d.id} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-ink-900">{d.title}</h4>
                                  <p className="text-xs text-ink-500">{d.fileName} · {d.fileSize}</p>
                                </div>
                              </div>
                              {d.description && <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">{d.description}</p>}
                              <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-3">
                                <Button size="sm" variant="outline" onClick={() => setViewingDoc(d.id)}>
                                  <Eye className="h-3.5 w-3.5" /> Preview
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Download className="h-3.5 w-3.5" /> Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 rounded-lg bg-accent-50 px-4 py-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                      <p className="text-xs text-accent-700">
                        You are viewing only the items explicitly assigned to you by {selectedOwnerUser.name}. Other liabilities and documents in the owner's vault remain private.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document preview modal */}
      {viewingDocRecord && (
        <Modal
          open
          onClose={() => setViewingDoc(null)}
          title={viewingDocRecord.title}
          description={`${viewingDocRecord.fileName} · ${viewingDocRecord.fileSize}`}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setViewingDoc(null)}>Close</Button>
              <Button><Download className="h-4 w-4" /> Secure download</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 py-16">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-500">{viewingDocRecord.fileName}</p>
                <p className="text-xs text-ink-400">Preview simulated in prototype</p>
              </div>
            </div>
            {viewingDocRecord.description && (
              <div>
                <p className="label-text">Description</p>
                <p className="text-sm text-ink-600">{viewingDocRecord.description}</p>
              </div>
            )}
            <div className="flex items-start gap-2 rounded-lg bg-brand-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <p className="text-xs text-brand-700">This document was explicitly unlocked for you. Download creates a secure, watermarked copy.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
