export type TAddToCartDto = {
  variantId: string;
  quantity: number;
};

export type TUpdateCartQuantityDto = {
  quantity: number;
};

export type TAddToGuestCartDto = {
  variantId: string;
  quantity: number;
  guestToken: string;
};

export type TMergeGuestCartDto = {
  guestToken: string;
};

export type CartMergeConflict = {
  variantId: string;
  requestedQuantity: number;
  finalQuantity: number;
  reason: "OUT_OF_STOCK" | "INSUFFICIENT_STOCK" | "VARIANT_NOT_FOUND";
  message: string;
};

export type MergeCartResponse = {
  conflicts: CartMergeConflict[];
  merged: boolean;
};
