import { z } from "zod";

export const checkoutSchema = z.object({
  thanaId: z.string().min(1, "Please select a Thana"),
  street: z.string().min(3, "Street / Area is required"),
  postalCode: z.string().optional(),
  // name: z
  //   .string()
  //   .min(5, "Name must be at least 5 characters")
  //   .max(50, "Name must not exceed 50 characters")
  //   .trim(),

  // mobileNumber: z
  //   .string()
  //   .min(11, "Mobile number is required")
  //   .regex(
  //     /^(\+8801|01)[3-9]\d{8}$/,
  //     "Please enter a valid Bangladesh phone number (e.g., +880173XXXXXXX)"
  //   ),

  // shippingLocation: z.enum(["inside", "outside"], {
  //   message: "Please select a valid shipping location",
  // }),

  // address: z.string().optional().default(""),

  // paymentOption: z.enum(["cod", "online"], {
  //   message: "Please select a valid payment option",
  // }),

  // Location fields - thanaId required to proceed
  // thanaId: z
  //   .string()
  //   .min(1, "Please select a Thana"),

  // street: z
  //   .string()
  //   .min(3, "Street / Area is required"),

  // postalCode: z.string().optional().default(""),

  // additionalNote: z
  //   .string()
  //   .max(500, "Additional note must not exceed 500 characters")
  //   .optional()
  //   .default(""),

  // selectedPaymentMethod: z
  //   .enum(["bkash", "nagad", "rocket", "upay", "bank", "card"], {
  //     message: "Please select a valid payment method",
  //   })
  //   .optional()
  //   .default("bkash"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
