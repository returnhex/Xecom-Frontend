import { CouponType } from "@/constants/enum";
import { TCoupon } from "@/types/marketing.type";

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

export type TCouponVariants = {
  variantId: string;
  quantity: number;
};

export type TValidateCouponDto = {
  code: string;
  variants: TCouponVariants[];
};

export type TValidateCouponResponse = {
  coupon: TCoupon;
  discountAmount: number;
  orderAmount: number;
  finalAmount: number;
  eligibleVariantIds: string[];
  appliesToAllRequestedVariants: boolean;
};

export type TSetCouponActiveDto = {
  isActive: boolean;
};
