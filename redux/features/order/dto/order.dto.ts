import { OrderStatus } from "@/constants/enum";

export type TCreateOrderDto = {
  addressId?: string;
  street?: string;
  postalCode?: number;
  thanaId?: string;
  addressType?: "HOME" | "OFFICE" | "OTHER";
  saveAddress?: boolean;
  notes?: string;
  couponCode?: string;
};

export type TUpdateOrderStatusDto = {
  status: OrderStatus;
  internalNotes?: string;
};
