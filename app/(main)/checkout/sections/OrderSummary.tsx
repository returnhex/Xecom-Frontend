"use client";

import Image from "next/image";
import { ShoppingCart, Tag, Truck, Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TShippingMethod } from "@/types/order.type";

interface Totals {
  totalPrice: number;
  shippingFee: number;
  couponDiscount: number;
  grandTotal: number;
}

interface OrderSummaryProps {
  activeStep: "items" | "info" | "payment";
  formValid: boolean;
  isOrdering: boolean;
  // Cart
  cartItems: CartItemApi[];
  getQty: (item: CartItemApi) => number;
  totals: Totals;
  // Coupon
  promoCode: string;
  appliedPromoCode: string;
  promoError: string;
  isValidatingCoupon: boolean;
  couponDiscountLabel: string;
  couponPartial: boolean;
  onPromoCodeChange: (code: string) => void;
  onApplyPromoCode: () => Promise<void>;
  onRemovePromoCode: () => void;
  // Shipping
  shippingMethods: TShippingMethod[];
  selectedShippingMethodId: string | null;
  onSelectShippingMethod: (id: string) => void;
  // Primary action (Proceed / Place Order)
  onAction: () => Promise<void>;
}

const OrderSummary = ({
  activeStep,
  formValid,
  isOrdering,
  cartItems,
  getQty,
  totals,
  promoCode,
  appliedPromoCode,
  promoError,
  isValidatingCoupon,
  couponDiscountLabel,
  couponPartial,
  onPromoCodeChange,
  onApplyPromoCode,
  onRemovePromoCode,
  shippingMethods,
  selectedShippingMethodId,
  onSelectShippingMethod,
  onAction,
}: OrderSummaryProps) => {
  return (
    <div>
      {/* Section header */}
      <div className="bg-primary mb-3 rounded-xl p-4">
        <div className="flex items-center text-white">
          <Truck className="mr-3 h-6 w-6" />
          <p className="font-semibold">Order Details</p>
        </div>
      </div>

      {/* Compact item list — shown only on the address step */}
      {activeStep === "info" && (
        <div className="bg-card-primary mb-3 rounded-xl p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold lg:text-lg">Items</h3>
            <ShoppingCart className="text-button-secondary h-5 w-5" />
          </div>
          {cartItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">No items in cart</p>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => {
                const product = item.variant?.product;
                const imageUrl = product?.images?.[0]?.imageUrl ?? "/placeholder.png";
                const finalPrice = Number(item.variant.discountPrice ?? item.variant.price);
                const qty = getQty(item);
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="cart-img-bg-primary h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={imageUrl}
                        alt={product?.name ?? "Product"}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{product?.name ?? "Product"}</p>
                      <p className="text-muted-foreground text-xs">Qty: {qty}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold">
                      Tk {(finalPrice * qty).toLocaleString("en-BD")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Discount Code */}
      <div className="bg-card-primary mb-3 rounded-xl p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold lg:text-lg">Discount Code</h3>
          <Tag className="text-button-secondary h-5 w-5" />
        </div>
        {!appliedPromoCode ? (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="cart-border-sec focus:ring-button-secondary flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none lg:text-lg"
              />
              <button
                onClick={onApplyPromoCode}
                disabled={isValidatingCoupon}
                className="bg-button-primary cursor-pointer rounded-lg px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isValidatingCoupon ? "..." : "Apply"}
              </button>
            </div>
            {promoError && <p className="text-danger mt-2 text-sm">{promoError}</p>}
          </div>
        ) : (
          <div className="bg-success border-success rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-foreground font-medium">{appliedPromoCode}</p>
                <p className="text-success-foreground text-sm">{couponDiscountLabel}</p>
              </div>
              <button
                onClick={onRemovePromoCode}
                className="text-danger hover:text-danger/80 cursor-pointer text-sm font-medium transition-colors"
              >
                Remove
              </button>
            </div>
            {couponPartial && (
              <p className="text-success-foreground/70 mt-2 text-xs">
                * Applies to eligible items only
              </p>
            )}
          </div>
        )}
      </div>

      {/* Shipping Method */}
      <div className="bg-card-primary mb-3 rounded-xl p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold lg:text-lg">Shipping Method</h3>
          <Truck className="text-button-secondary h-5 w-5" />
        </div>
        {shippingMethods.length === 0 ? (
          <p className="text-muted-foreground text-sm">No shipping methods available</p>
        ) : (
          <div className="space-y-2">
            {shippingMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => onSelectShippingMethod(method.id)}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  selectedShippingMethodId === method.id
                    ? "border-button-primary bg-button-primary/5"
                    : "border-border hover:border-button-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{method.name}</p>
                    {method.estimatedDays != null && (
                      <p className="text-muted-foreground text-xs">
                        Est. {method.estimatedDays} days
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold">
                    {method.cost ? `Tk ${Number(method.cost).toLocaleString("en-BD")}` : "Free"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-card-primary rounded-xl p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold lg:text-lg">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Price ({cartItems.length} products)</span>
            <span className="text-sm font-medium lg:text-lg">
              Tk {totals.totalPrice.toLocaleString("en-BD")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping Fee</span>
            <span className="text-sm font-medium lg:text-lg">
              {selectedShippingMethodId
                ? totals.shippingFee === 0
                  ? "Free"
                  : `Tk ${totals.shippingFee.toLocaleString("en-BD")}`
                : "—"}
            </span>
          </div>
          {appliedPromoCode && totals.couponDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coupon Discount</span>
              <span className="text-danger font-medium">
                - Tk {totals.couponDiscount.toLocaleString("en-BD")}
              </span>
            </div>
          )}
          <div className="cart-border-primary mt-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold lg:text-lg">Total</span>
              <div className="text-right">
                <div className="cart-light-text text-2xl font-bold">
                  Tk {totals.grandTotal.toLocaleString("en-BD")}
                </div>
                <p className="cart-text-base mt-1 text-sm">Total amount to be paid</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {activeStep === "info" && !formValid ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="border-border mt-6 flex w-full cursor-not-allowed items-center justify-center rounded-lg border bg-black/10 px-4 py-3 font-semibold opacity-50 shadow-sm"
                >
                  <Lock className="mr-2" size={20} />
                  Place Order
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Complete the Address</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please select Country, Division, District, Thana and fill in your Street before
                    placing the order.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Okay</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <button
              onClick={onAction}
              disabled={isOrdering}
              className="bg-button-primary mt-6 w-full transform cursor-pointer rounded-lg px-4 py-3 font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {activeStep === "items" && `Proceed to Checkout (${cartItems.length})`}
              {activeStep === "info" && (isOrdering ? "Placing Order..." : "Place Order")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
