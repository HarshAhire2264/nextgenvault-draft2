export type Role = 'owner' | 'beneficiary' | 'admin';

export type LiabilityType = 'password' | 'emi' | 'credit_card';

export type LiabilityCategory = 'password';

export type LegacyStatus = 'inactive' | 'pending' | 'active';

export type UserStatus = 'active' | 'suspended' | 'pending_verification';

export interface LiabilityRecord {
  id: string;
  ownerId: string;
  title: string;
  type: LiabilityType;
  category: LiabilityCategory;
  username?: string;
  passwordValue?: string;
  url?: string;
  notes?: string;
  amount?: number;
  institution?: string;
  dueDate?: string;
  lastFourDigits?: string;
  status: 'open' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  ownerId: string;
  liabilityId?: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'doc';
  fileSize: string;
  description?: string;
  uploadedAt: string;
}

export interface BeneficiaryAssignment {
  id: string;
  ownerId: string;
  beneficiaryId: string;
  liabilityAccess: string[]; // liability ids
  documentAccess: string[]; // document ids
  addedAt: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  password: string; // mock only
  createdAt: string;
  verified: boolean;
}

export interface ActivationRequest {
  id: string;
  ownerId: string;
  beneficiaryId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AuthSession {
  token: string;
  user: UserRecord;
}
