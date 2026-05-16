import { UserStatus } from "@/constants/enum";

export type TChangeStatusDto = {
  status: UserStatus;
};

export type TAddAddressDto = {
  userId?: string;
  thanaId: string;
  postalCode?: string;
  street: string;
};

export type TUserMetadata = {
  totalUsers: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  totalVerifiedAccounts: number;
};

export type TUpdateUserDto = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: File | string;
};

export type TUpdateAddressDto = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type TChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
