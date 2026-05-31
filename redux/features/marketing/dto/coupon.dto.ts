import { CouponType } from "@/constants/enum";

export type TAddCouponDto = {
  code: string;
  name: string;
  description?: string;
  type?: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  userUsageLimit?: number;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
};

export type TUpdateCouponDto = Partial<TAddCouponDto>;

export type TValidateCouponDto = {
  code: string;
  orderAmount: number;
  shippingCost?: number;
  productIds?: string[];
  categoryIds?: string[];
};

export type TSetCouponActiveDto = {
  isActive: boolean;
};
