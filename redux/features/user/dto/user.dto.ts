import { UserStatus } from "@/constants/enum";

export type TChangeStatusDto = {
  status: UserStatus;
};

export type TUserMetadata = {
  totalUsers: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  totalVerifiedAccounts: number;
};

export type TChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type TAddOrUpdateUserAddressDto = {
  thanaId: string;
  postalCode?: number;
  street: string;
  isDefault: boolean;
};

export type TUserAddress = {
  addressId: string;
  street: string;
  postalCode: number;
  isDefault: boolean;
  thanaId: string;
  districtId: string;
  divisionId: string;
  countryId: string;
  thanaName: string;
  districtName: string;
  divisionName: string;
  countryName: string;
};
