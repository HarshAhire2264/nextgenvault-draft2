import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ActivationRequest,
  BeneficiaryAssignment,
  DocumentRecord,
  LiabilityRecord,
  Role,
  UserRecord,
} from '@/types';
import {
  mockActivations,
  mockAssignments,
  mockDocuments,
  mockLiabilities,
  mockUsers,
} from '@/mockData';

interface AppContextValue {
  session: { token: string; user: UserRecord } | null;
  activeRole: Role | null;
  users: UserRecord[];
  liabilities: LiabilityRecord[];
  documents: DocumentRecord[];
  assignments: BeneficiaryAssignment[];
  activations: ActivationRequest[];
  legacyStatus: Record<string, 'inactive' | 'pending' | 'active'>;

  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string, role: Role) => { ok: boolean; error?: string };
  logout: () => void;
  switchRole: (role: Role) => void;

  addLiability: (l: Omit<LiabilityRecord, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'status'> & { status?: LiabilityRecord['status'] }) => void;
  updateLiability: (id: string, patch: Partial<LiabilityRecord>) => void;
  closeLiability: (id: string) => void;
  archiveLiability: (id: string) => void;
  reopenLiability: (id: string) => void;

  addDocument: (d: Omit<DocumentRecord, 'id' | 'uploadedAt' | 'ownerId'>) => void;
  deleteDocument: (id: string) => void;

  addBeneficiary: (beneficiaryId: string, liabilityAccess: string[], documentAccess: string[]) => { ok: boolean; error?: string };
  updateBeneficiaryAccess: (assignmentId: string, liabilityAccess: string[], documentAccess: string[]) => void;
  removeBeneficiary: (assignmentId: string) => void;

  triggerLegacyActivation: (ownerId: string) => void;
  approveActivation: (activationId: string) => void;
  rejectActivation: (activationId: string) => void;

  adminUpdateUser: (userId: string, patch: Partial<UserRecord>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function makeToken(user: UserRecord): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
  };
  return `mock.${btoa(JSON.stringify(payload))}.signature`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AppContextValue['session']>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [users, setUsers] = useState<UserRecord[]>(mockUsers);
  const [liabilities, setLiabilities] = useState<LiabilityRecord[]>(mockLiabilities);
  const [documents, setDocuments] = useState<DocumentRecord[]>(mockDocuments);
  const [assignments, setAssignments] = useState<BeneficiaryAssignment[]>(mockAssignments);
  const [activations, setActivations] = useState<ActivationRequest[]>(mockActivations);
  const [legacyStatus, setLegacyStatus] = useState<Record<string, 'inactive' | 'pending' | 'active'>>({
    'u-owner-1': 'inactive',
    'u-owner-2': 'inactive',
  });

  useEffect(() => {
    if (session) setActiveRole(session.user.role);
  }, [session]);

  const login = useCallback((email: string, password: string) => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, error: 'No account found with that email.' };
    if (user.password !== password) return { ok: false, error: 'Incorrect password.' };
    if (user.status === 'suspended') return { ok: false, error: 'This account has been suspended.' };
    setSession({ token: makeToken(user), user });
    return { ok: true };
  }, [users]);

  const register = useCallback((name: string, email: string, password: string, role: Role) => {
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with that email already exists.' };
    }
    const newUser: UserRecord = {
      id: `u-${Date.now()}`,
      name,
      email,
      role,
      status: role === 'admin' ? 'pending_verification' : 'active',
      password,
      createdAt: new Date().toISOString(),
      verified: role === 'admin',
    };
    setUsers((prev) => [...prev, newUser]);
    if (role === 'owner') {
      setLegacyStatus((prev) => ({ ...prev, [newUser.id]: 'inactive' }));
    }
    setSession({ token: makeToken(newUser), user: newUser });
    return { ok: true };
  }, [users]);

  const logout = useCallback(() => {
    setSession(null);
    setActiveRole(null);
  }, []);

  const switchRole = useCallback((role: Role) => {
    setActiveRole(role);
  }, []);

  const addLiability = useCallback<AppContextValue['addLiability']>((l) => {
    if (!session) return;
    const now = new Date().toISOString();
    const newLiability: LiabilityRecord = {
      id: `l-${Date.now()}`,
      ownerId: session.user.id,
      createdAt: now,
      updatedAt: now,
      status: l.status ?? 'open',
      ...l,
    };
    setLiabilities((prev) => [newLiability, ...prev]);
  }, [session]);

  const updateLiability = useCallback((id: string, patch: Partial<LiabilityRecord>) => {
    setLiabilities((prev) => prev.map((l) => l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l));
  }, []);

  const closeLiability = useCallback((id: string) => {
    setLiabilities((prev) => prev.map((l) => l.id === id ? { ...l, status: 'closed', updatedAt: new Date().toISOString() } : l));
  }, []);

  const archiveLiability = useCallback((id: string) => {
    setLiabilities((prev) => prev.map((l) => l.id === id ? { ...l, status: 'archived', updatedAt: new Date().toISOString() } : l));
  }, []);

  const reopenLiability = useCallback((id: string) => {
    setLiabilities((prev) => prev.map((l) => l.id === id ? { ...l, status: 'open', updatedAt: new Date().toISOString() } : l));
  }, []);

  const addDocument = useCallback<AppContextValue['addDocument']>((d) => {
    if (!session) return;
    const newDoc: DocumentRecord = {
      id: `d-${Date.now()}`,
      ownerId: session.user.id,
      uploadedAt: new Date().toISOString(),
      ...d,
    };
    setDocuments((prev) => [newDoc, ...prev]);
  }, [session]);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addBeneficiary = useCallback<AppContextValue['addBeneficiary']>((beneficiaryId, liabilityAccess, documentAccess) => {
    if (!session) return { ok: false, error: 'No session' };
    const beneficiary = users.find((u) => u.id === beneficiaryId);
    if (!beneficiary) return { ok: false, error: 'User not found.' };
    if (beneficiary.role !== 'beneficiary') return { ok: false, error: 'Selected user is not a beneficiary.' };
    const exists = assignments.some((a) => a.ownerId === session.user.id && a.beneficiaryId === beneficiaryId);
    if (exists) return { ok: false, error: 'This beneficiary is already assigned.' };
    const newAssignment: BeneficiaryAssignment = {
      id: `a-${Date.now()}`,
      ownerId: session.user.id,
      beneficiaryId,
      liabilityAccess,
      documentAccess,
      addedAt: new Date().toISOString(),
    };
    setAssignments((prev) => [...prev, newAssignment]);
    return { ok: true };
  }, [session, users, assignments]);

  const updateBeneficiaryAccess = useCallback((assignmentId: string, liabilityAccess: string[], documentAccess: string[]) => {
    setAssignments((prev) => prev.map((a) => a.id === assignmentId ? { ...a, liabilityAccess, documentAccess } : a));
  }, []);

  const removeBeneficiary = useCallback((assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  }, []);

  const triggerLegacyActivation = useCallback((ownerId: string) => {
    setLegacyStatus((prev) => ({ ...prev, [ownerId]: 'pending' }));
    const beneficiaries = assignments
      .filter((a) => a.ownerId === ownerId)
      .map((a) => a.beneficiaryId);
    setActivations((prev) => {
      const existing = new Set(prev.filter((a) => a.ownerId === ownerId && a.status === 'pending').map((a) => a.beneficiaryId));
      const newOnes: ActivationRequest[] = beneficiaries
        .filter((bid) => !existing.has(bid))
        .map((bid) => ({
          id: `act-${Date.now()}-${bid}`,
          ownerId,
          beneficiaryId: bid,
          status: 'pending' as const,
          requestedAt: new Date().toISOString(),
        }));
      return [...prev, ...newOnes];
    });
  }, [assignments]);

  const approveActivation = useCallback((activationId: string) => {
    setActivations((prev) => prev.map((a) => a.id === activationId ? { ...a, status: 'approved', reviewedAt: new Date().toISOString() } : a));
    setLegacyStatus((prev) => {
      const act = activations.find((a) => a.id === activationId);
      if (!act) return prev;
      const ownerPending = activations.some((a) => a.ownerId === act.ownerId && a.id !== activationId && a.status === 'pending');
      if (!ownerPending) return { ...prev, [act.ownerId]: 'active' };
      return prev;
    });
  }, [activations]);

  const rejectActivation = useCallback((activationId: string) => {
    setActivations((prev) => prev.map((a) => a.id === activationId ? { ...a, status: 'rejected', reviewedAt: new Date().toISOString() } : a));
  }, []);

  const adminUpdateUser = useCallback((userId: string, patch: Partial<UserRecord>) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...patch } : u));
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    session,
    activeRole,
    users,
    liabilities,
    documents,
    assignments,
    activations,
    legacyStatus,
    login,
    register,
    logout,
    switchRole,
    addLiability,
    updateLiability,
    closeLiability,
    archiveLiability,
    reopenLiability,
    addDocument,
    deleteDocument,
    addBeneficiary,
    updateBeneficiaryAccess,
    removeBeneficiary,
    triggerLegacyActivation,
    approveActivation,
    rejectActivation,
    adminUpdateUser,
  }), [session, activeRole, users, liabilities, documents, assignments, activations, legacyStatus, login, register, logout, switchRole, addLiability, updateLiability, closeLiability, archiveLiability, reopenLiability, addDocument, deleteDocument, addBeneficiary, updateBeneficiaryAccess, removeBeneficiary, triggerLegacyActivation, approveActivation, rejectActivation, adminUpdateUser]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
