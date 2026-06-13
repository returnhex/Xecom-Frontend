import { OrderStatus } from "@/constants/enum";

export type TCreateOrderDto = {
  addressId?: string;
  thanaId?: string; // If no addressId, then these fields are required
  street?: string; // If no addressId, then these fields are required
  postalCode?: string; // If no addressId, then these fields are required
  isDefault?: boolean; // If no addressId, then these fields are required
  notes?: string;
  couponCode?: string;
  shippingMethodId: string
};

export type TUpdateOrderStatusDto = {
  status: OrderStatus;
  internalNotes?: string;
};
