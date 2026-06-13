"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Truck, Shield, CreditCard, ArrowRight, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";
import AddressInfo, { TOrderAddressPayload } from "./sections/AddressInfo";
import CartItems from "./sections/CartItems";
import OrderSummary from "./sections/OrderSummary";
import { useCreateOrderMutation } from "@/redux/features/order/order.api";
import { useValidateCouponMutation } from "@/redux/features/marketing/coupon.api";
import { useGetAllShippingMethodsQuery } from "@/redux/features/order/shipping-method.api";
import {
  useGetMyCartQuery,
  useGetGuestCartQuery,
  useUpdateCartQuantityMutation,
  useDeleteCartItemMutation,
  useUpdateGuestCartQuantityMutation,
  useDeleteGuestCartItemMutation,
} from "@/redux/features/order/cart.api";
import { TValidateCouponResponse } from "@/redux/features/marketing/dto/coupon.dto";
import { CouponType } from "@/constants/enum";
import { TShippingMethod } from "@/types/order.type";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { Button } from "@/components/ui/button";

const CheckoutPage = () => {
  const user = useAppSelector(selectCurrentUser);
  const [guestToken, setGuestToken] = useState<string>("");

  useEffect(() => {
    const sync = (e?: StorageEvent) => {
      if (e && e.key !== "guestToken") return;
      if (!user) setGuestToken(localStorage.getItem("guestToken") ?? "");
    };
    sync();
    window.addEventListener("storage", sync as EventListener);
    return () => window.removeEventListener("storage", sync as EventListener);
  }, [user]);

  const [activeStep, setActiveStep] = useState<"items" | "info" | "payment">("items");
  const [formValid, setFormValid] = useState(false);
  const [promoCode, setPromoCode] = useState<string>("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>("");
  const [promoError, setPromoError] = useState<string>("");
  const [couponValidation, setCouponValidation] = useState<TValidateCouponResponse | null>(null);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | null>(null);
  const [orderAddress, setOrderAddress] = useState<TOrderAddressPayload>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [orderNote, setOrderNote] = useState("");
  const [localQuantity, setLocalQuantity] = useState<LocalQuantity>({});
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const { data: myCartData, isLoading: myCartLoading } = useGetMyCartQuery(undefined, {
    skip: !user,
  });
  const { data: guestCartData, isLoading: guestCartLoading } = useGetGuestCartQuery(guestToken, {
    skip: !!user || !guestToken,
  });

  const [updateCartQuantity] = useUpdateCartQuantityMutation();
  const [deleteCartItem] = useDeleteCartItemMutation();
  const [updateGuestCartQuantity] = useUpdateGuestCartQuantityMutation();
  const [deleteGuestCartItem] = useDeleteGuestCartItemMutation();

  const cartData = user ? myCartData : guestCartData;
  const isCartLoading = user ? myCartLoading : guestCartLoading;
  const cart = cartData?.data as unknown as CartApi;
  const cartItems: CartItemApi[] = cart?.items ?? [];

  const [createOrder, { isLoading: isOrdering }] = useCreateOrderMutation();
  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();
  const { data: shippingMethodsData } = useGetAllShippingMethodsQuery(undefined);
  const shippingMethods: TShippingMethod[] = (shippingMethodsData?.data ?? []).filter(
    (m: TShippingMethod) => m.isActive
  );
  const selectedShippingMethod =
    shippingMethods.find((m) => m.id === selectedShippingMethodId) ?? null;

  const getQty = (item: CartItemApi) => localQuantity[item.id] ?? item.quantity;

  const calculateTotals = () => {
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.variant.discountPrice ?? item.variant.price) * getQty(item),
      0
    );
    const shippingFee = selectedShippingMethod ? Number(selectedShippingMethod.cost ?? 0) : 0;
    const couponDiscount = couponValidation?.discountAmount ?? 0;

    return {
      totalPrice,
      shippingFee,
      couponDiscount,
      grandTotal: Math.max(0, totalPrice + shippingFee - couponDiscount),
    };
  };

  const totals = calculateTotals();

  const getCouponDiscountLabel = () => {
    if (!couponValidation) return "";
    const { coupon, discountAmount } = couponValidation;
    const saved = `Tk ${discountAmount.toLocaleString("en-BD")}`;
    switch (coupon.type) {
      case CouponType.PERCENTAGE:
        return `${coupon.value}% off — ${saved} saved`;
      case CouponType.FIXED_AMOUNT:
        return `${saved} off`;
      case CouponType.FREE_SHIPPING:
        return `Free shipping — ${saved} saved`;
      default:
        return `${saved} off`;
    }
  };

  const applyPromoCode = async (): Promise<void> => {
    const trimmedCode = promoCode.trim().toUpperCase();
    if (!trimmedCode) {
      setPromoError("Please enter a promo code");
      return;
    }
    try {
      const result = await validateCoupon({
        code: trimmedCode,
        variants: cartItems.map((item) => ({
          variantId: item.variantId,
          quantity: getQty(item),
        })),
      }).unwrap();
      const validation: TValidateCouponResponse = (result as any)?.data ?? result;
      setCouponValidation(validation);
      setAppliedPromoCode(trimmedCode);
      setPromoError("");
      setPromoCode("");
    } catch (err: any) {
      setPromoError(err?.data?.message || "Invalid or expired coupon code");
      setCouponValidation(null);
      setAppliedPromoCode("");
    }
  };

  const removePromoCode = (): void => {
    setAppliedPromoCode("");
    setPromoError("");
    setCouponValidation(null);
  };

  const updateQuantity = async (item: CartItemApi, inc: boolean) => {
    const current = getQty(item);
    const newQty = inc ? current + 1 : Math.max(1, current - 1);
    if (newQty === current) return;

    setLocalQuantity((prev) => ({ ...prev, [item.id]: newQty }));
    setUpdatingItems((prev) => new Set(prev).add(item.id));

    try {
      if (user) {
        await updateCartQuantity({ id: item.id, data: { quantity: newQty } }).unwrap();
      } else {
        await updateGuestCartQuantity({
          guestToken,
          id: item.id,
          data: { quantity: newQty },
        }).unwrap();
      }
    } catch {
      setLocalQuantity((prev) => ({ ...prev, [item.id]: current }));
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const setQuantity = async (item: CartItemApi, newQty: number) => {
    const clamped = Math.max(1, Math.min(newQty, item.variant.stockQuantity));
    const current = getQty(item);
    if (clamped === current) return;

    setLocalQuantity((prev) => ({ ...prev, [item.id]: clamped }));
    setUpdatingItems((prev) => new Set(prev).add(item.id));

    try {
      if (user) {
        await updateCartQuantity({ id: item.id, data: { quantity: clamped } }).unwrap();
      } else {
        await updateGuestCartQuantity({
          guestToken,
          id: item.id,
          data: { quantity: clamped },
        }).unwrap();
      }
    } catch {
      setLocalQuantity((prev) => ({ ...prev, [item.id]: current }));
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (user) {
      await deleteCartItem(cartItemId);
    } else {
      await deleteGuestCartItem({ guestToken, id: cartItemId });
    }
    setLocalQuantity((prev) => {
      const next = { ...prev };
      delete next[cartItemId];
      return next;
    });
  };

  const handleLocationChange = (data: TOrderAddressPayload) => {
    setOrderAddress(data);
    setFormValid("addressId" in data ? !!data.addressId : !!(data.thanaId && data.street));
  };

  const handlePlaceOrder = async () => {
    if (!formValid) return;
    if (!selectedShippingMethodId) {
      toast.error("Please select a shipping method");
      return;
    }

    try {
      const basePayload = {
        couponCode: appliedPromoCode || undefined,
        shippingMethodId: selectedShippingMethodId!,
        notes: orderNote.trim() || undefined,
      };
      const payload =
        "addressId" in orderAddress && orderAddress.addressId
          ? { ...basePayload, addressId: orderAddress.addressId }
          : {
              ...basePayload,
              thanaId: orderAddress.thanaId,
              street: orderAddress.street,
              postalCode: orderAddress.postalCode || undefined,
              isDefault: orderAddress.isDefault,
            };

      await createOrder(payload).unwrap();

      setCompletedSteps((prev) => new Set(prev).add("info"));
      setActiveStep("payment");
      toast.success("Place Order Successful!");

      setOrderAddress({});
      setFormValid(false);
      setAppliedPromoCode("");
      setPromoCode("");
      setPromoError("");
      setCouponValidation(null);
      setSelectedShippingMethodId(null);
      setOrderNote("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Order failed. Please try again.");
    }
  };

  const handleAction = async () => {
    if (activeStep === "items") {
      setCompletedSteps((prev) => new Set(prev).add("items"));
      setActiveStep("info");
    } else if (activeStep === "info") {
      await handlePlaceOrder();
    }
  };

  return (
    <div className="cart-bg container min-h-screen">
      <div className="mx-auto">
        <div className="justify-center gap-3 px-4 lg:flex">
          {/* ─────────── Left Column ─────────── */}
          <div className={`${activeStep === "payment" ? "lg:w-full" : "lg:w-8/12"}`}>
            <div className="mb-3">
              <Tabs
                value={activeStep}
                onValueChange={(value) => {
                  if (value === "items") setActiveStep("items");
                  else if (value === "info" && completedSteps.has("items")) setActiveStep("info");
                  else if (value === "payment" && formValid) setActiveStep("payment");
                }}
              >
                <TabsList className="bg-card-primary flex h-auto w-full flex-wrap items-center gap-2 rounded-lg px-4 py-2 shadow-sm">
                  <TabsTrigger
                    value="items"
                    className="data-[state=active]:text-button-secondary flex items-center space-x-2 rounded-lg px-4 py-4 transition-all"
                  >
                    <ShoppingCart size={20} />
                    <span className="hidden font-medium md:inline">Items</span>
                  </TabsTrigger>
                  <ArrowRight className="mx-1" />
                  <TabsTrigger
                    value="info"
                    disabled={!completedSteps.has("items")}
                    className="data-[state=active]:text-button-secondary flex items-center space-x-2 rounded-lg px-4 py-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MapPin size={20} />
                    <span className="hidden font-medium md:inline">Delivery Address</span>
                  </TabsTrigger>
                  <ArrowRight className="mx-1" />
                  <TabsTrigger
                    value="payment"
                    disabled={!formValid}
                    className="data-[state=active]:text-button-secondary flex items-center space-x-2 rounded-lg px-4 py-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CreditCard size={20} />
                    <span className="hidden font-medium md:inline">Order Placed</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-3">
                {/* ─────────── ITEMS STEP ─────────── */}
                {activeStep === "items" && (
                  <CartItems
                    cartItems={cartItems}
                    isLoading={isCartLoading}
                    updatingItems={updatingItems}
                    getQty={getQty}
                    onUpdateQuantity={updateQuantity}
                    onSetQuantity={setQuantity}
                    onRemoveItem={removeItem}
                  />
                )}

                {/* ─────────── INFO STEP ─────────── */}
                {activeStep === "info" && (
                  <div className="space-y-3">
                    <div className="bg-card-primary rounded-lg p-4 shadow-sm lg:p-6">
                      <h2 className="mb-4 text-xl font-bold">Delivery Address</h2>
                      <AddressInfo onLocationChange={handleLocationChange} />
                    </div>
                    <div className="bg-card-primary rounded-lg p-4 shadow-sm lg:p-6">
                      <h3 className="mb-3 text-sm font-semibold lg:text-base">
                        Order Note (optional)
                      </h3>
                      <textarea
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="Any special instructions for your order..."
                        rows={3}
                        className="border-border bg-card-primary focus:ring-button-primary w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* ─────────── PAYMENT SUCCESS STEP ─────────── */}
                {activeStep === "payment" && (
                  <div className="bg-card-primary flex items-center justify-center py-10">
                    <div className="w-full max-w-md p-6 text-center">
                      <p className="text-muted-foreground mb-2 text-sm">🎉 Thank You</p>
                      <h1 className="mb-2 text-2xl font-semibold">Your order has been received</h1>
                      <p className="text-muted-foreground mb-6 text-sm">
                        Thanks for your order. Your order will be processed as soon as possible. You
                        will be receiving an email shortly with your invoice number.
                      </p>
                      <div className="mb-6 text-center text-sm">
                        <div className="inline-block space-y-3 text-left">
                          <p>
                            <strong>Order Status:</strong> Order Submitted
                          </p>
                          <p>
                            <strong>Order Value:</strong> Tk.{" "}
                            {totals.grandTotal.toLocaleString("en-BD")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-center gap-4">
                        <Link href="/track-order">
                          <Button >
                            <Truck size={18} />
                            <span>Track Order</span>
                          </Button>
                        </Link>
                        <Link href="/">
                          <Button variant={"secondary"}>
                            <ShoppingCart size={18} />
                            <span>Continue Shopping</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─────────── Right Column ─────────── */}
          {activeStep !== "payment" && (
            <div className="mt-3 lg:mt-0 lg:w-4/12">
              <OrderSummary
                activeStep={activeStep}
                formValid={formValid}
                isOrdering={isOrdering}
                cartItems={cartItems}
                getQty={getQty}
                totals={totals}
                promoCode={promoCode}
                appliedPromoCode={appliedPromoCode}
                promoError={promoError}
                isValidatingCoupon={isValidatingCoupon}
                couponDiscountLabel={getCouponDiscountLabel()}
                couponPartial={
                  !!couponValidation && !couponValidation.appliesToAllRequestedVariants
                }
                onPromoCodeChange={(code) => {
                  setPromoCode(code);
                  setPromoError("");
                }}
                onApplyPromoCode={applyPromoCode}
                onRemovePromoCode={removePromoCode}
                shippingMethods={shippingMethods}
                selectedShippingMethodId={selectedShippingMethodId}
                onSelectShippingMethod={setSelectedShippingMethodId}
                onAction={handleAction}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
