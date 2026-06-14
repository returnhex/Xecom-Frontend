import { z } from "zod";

export const shippingMethodSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code must be less than 50 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  cost: z.number({ error: "Cost is required" }).min(0, "Cost cannot be negative"),
  estimatedDays: z.string().min(1, "Estimated days is required"),
  isActive: z.boolean().optional(),
});

export type TShippingMethodFormData = z.infer<typeof shippingMethodSchema>;
