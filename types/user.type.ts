import { CustomerType, Gender, UserRole, UserStatus } from "@/constants/enum";

export type TUser = {
  id: string;
  tenantId?: string | null;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  profilePicture?: string | null;
  gender?: Gender | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: string | null;
  preferences: any;
  metadata: any;
  country?: string | null;
  division?: string | null;
  district?: string | null;
  thana?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TAdmin = {
  id: string;
  userId: string;
  user?: TUser;
  permissions: any;
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  employeeId: string;
  hireDate?: string | null;
  salary?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TStaff = {
  id: string;
  userId: string;
  user?: TUser;
  permissions: any;
  canManageOrders: boolean;
  canManageInventory: boolean;
  canViewReports: boolean;
  employeeId?: string | null;
  managerId?: string | null;
  hireDate?: string | null;
  hourlyRate?: string | null;
  workSchedule?: any | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TCustomer = {
  id: string;
  userId: string;
  user?: TUser;
  dateOfBirth?: string | null;
  gender?: string | null;
  customerType: CustomerType;
  loyaltyPoints: number;
  totalSpent: string;
  preferredLanguage?: string | null;
  preferredCurrency?: string | null;
  marketingOptIn: boolean;
  referralCode?: string | null;
  referredBy?: string | null;
  vatNumber?: string | null;
  companyName?: string | null;
  lastPurchaseAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
