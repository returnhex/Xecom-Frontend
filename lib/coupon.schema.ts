import { z } from "zod";
import { CouponType } from "@/constants/enum";

const optionalNumber = z.number().min(0, "Cannot be negative").optional();

export const couponSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code must be less than 50 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  type: z.nativeEnum(CouponType, { error: "Type is required" }),
  value: z.number({ error: "Value is required" }).positive("Value must be greater than 0"),
  minOrderAmount: optionalNumber,
  maxDiscountAmount: optionalNumber,
  usageLimit: optionalNumber,
  userUsageLimit: optionalNumber,
  isActive: z.boolean().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type TCouponFormData = z.infer<typeof couponSchema>;
