"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Truck,
  Shield,
  CreditCard,
  ArrowRight,
  Check,
  Tag,
  Trash2,
  Lock,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CartData } from "@/data/cart";
import { checkoutSchema, type CheckoutFormData } from "@/lib/shepping.Schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
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
import Link from "next/link";
import ShippingInfo from "./sections/ShippingInfo";
import { useCreateOrderMutation } from "@/redux/features/order/order.api";

interface Voucher {
  id: string;
  name: string;
  description: string;
  discount: number;
  type: "freeShipping" | "discount" | "coins";
  minPurchase: number;
}

interface CartItem {
  id: string;
  store: string;
  name: string;
  description: string;
  originalPrice: number;
  discountPercentage: number;
  finalPrice: number;
  image: any;
  selected: boolean;
  quantity: number;
  comboOffer?: boolean;
  sheppingFee: number;
}

const CheckoutPage = () => {
  const [activeStep, setActiveStep] = useState<"items" | "info" | "payment">("items");

  const [touched, setTouched] = useState({
    thanaId: false,
    street: false,
  });

  const INSIDE_DHAKA_FEE = 100;
  const OUTSIDE_DHAKA_FEE = 150;

  const [formValid, setFormValid] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(CartData);
  const [promoCode, setPromoCode] = useState<string>("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>("");
  const [promoError, setPromoError] = useState<string>("");

  const [createOrder, { isLoading: isOrdering }] = useCreateOrderMutation();

  const validPromoCodes = ["SAVE10", "DISCOUNT10", "PROMO10"];

  const applyPromoCode = (): void => {
    const trimmedCode = promoCode.trim().toUpperCase();
    if (!trimmedCode) {
      setPromoError("Please enter a promo code");
      return;
    }
    if (validPromoCodes.includes(trimmedCode)) {
      setAppliedPromoCode(trimmedCode);
      setPromoError("");
      setPromoCode("");
    } else {
      setPromoError("Invalid promo code");
      setAppliedPromoCode("");
    }
  };

  const removePromoCode = (): void => {
    setAppliedPromoCode("");
    setPromoError("");
  };

  const vouchers: Voucher[] = [
    {
      id: "v1",
      name: "Shipping Discount",
      description: "Minimum spend Tk 1000",
      discount: 145,
      type: "freeShipping",
      minPurchase: 1000,
    },
  ];

  const updateQuantity = (id: string, increment: boolean) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          const newQuantity = increment ? item.quantity + 1 : Math.max(1, item.quantity - 1);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // ── Form state — only location fields ────────────────────────────────────
  const [formData, setFormData] = useState<CheckoutFormData>({
    thanaId: "",
    street: "",
    postalCode: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Called by ShippingInfo whenever any location field changes
  const handleLocationChange = (data: CheckoutFormData) => {
    setFormData(data);

    const validation = checkoutSchema.safeParse(data);
    setFormValid(validation.success);

    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (touched.thanaId && !data.thanaId) {
      newErrors.thanaId = "Please select a Thana";
    }

    if (touched.street && (!data.street || data.street.length < 3)) {
      newErrors.street = "Street / Area is required";
    }

    setFormErrors(newErrors);
  };
  const calculateTotals = () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    const totalPrice = selectedItems.reduce(
      (sum, item) => sum + item.finalPrice * item.quantity,
      0
    );
    // Default to inside Dhaka fee for display; real fee comes from backend
    const baseShippingFee = INSIDE_DHAKA_FEE;

    let shippingFee = baseShippingFee;
    let savedShippingFee = 0;

    if (totalPrice >= 1000) {
      savedShippingFee = baseShippingFee;
      shippingFee = 0;
    }

    const promoDiscount = appliedPromoCode ? totalPrice * 0.1 : 0;
    const totalDiscount = promoDiscount + savedShippingFee;

    return {
      totalPrice,
      shippingFee,
      fullShippingFee: baseShippingFee,
      savedShippingFee,
      promoDiscount,
      totalDiscount,
      grandTotal: Math.max(0, totalPrice + shippingFee - promoDiscount),
    };
  };

  const groupedItems = cartItems.reduce(
    (groups, item) => {
      if (!groups[item.store]) groups[item.store] = [];
      groups[item.store].push(item);
      return groups;
    },
    {} as Record<string, CartItem[]>
  );

  const totals = calculateTotals();

  const getOfferMessage = () => {
    const remaining = 1000 - totals.totalPrice;
    if (totals.totalPrice < 1000) {
      return {
        status: "locked",
        message: `Spend Tk ${remaining.toLocaleString("en-BD")} more to unlock shipping offer`,
      };
    }
    return { status: "active", message: "🎉 Free shipping applied (Inside Dhaka)" };
  };
  const offerInfo = getOfferMessage();

  const handlePlaceOrder = async () => {
    if (!formValid) return;

    try {
      await createOrder({
        thanaId: formData.thanaId,
        street: formData.street,
        postalCode: formData.postalCode || undefined,
        couponCode: appliedPromoCode || undefined,
      }).unwrap();

      setCompletedSteps((prev) => new Set(prev).add("info"));
      setActiveStep("payment");
      toast.success("Place Order Successful!");

      // Reset
      setFormData({ thanaId: "", street: "", postalCode: "" });
      setFormErrors({});
      setFormValid(false);
      setAppliedPromoCode("");
      setPromoCode("");
      setPromoError("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Order failed. Please try again.");
    }
  };

  return (
    <div className="cart-bg min-h-screen container">
      <div className="mx-auto">
        <div className=" justify-center gap-3 px-4 lg:flex">
          {/* Left Column */}
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
                  <div>
                    {Object.entries(groupedItems).map(([store, items]) => (
                      <div
                        key={store}
                        className="bg-card-primary mb-3 overflow-hidden rounded-xl px-2 shadow-sm"
                      >
                        <Accordion type="single" collapsible defaultValue={store}>
                          <AccordionItem value={store}>
                            <AccordionTrigger>
                              <div className="p-2">
                                <div className="flex cursor-pointer items-center justify-between">
                                  <div className="ml-3">
                                    <h3 className="text-lg font-semibold lg:text-xl">{store}</h3>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="cart-border-primary border-border divide-y border-t">
                                {items.map((item) => (
                                  <div key={item.id} className="cursor-pointer p-4">
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                      <div className="cart-img-bg-primary h-24 w-full shrink-0 overflow-hidden rounded-lg sm:w-24">
                                        <div className="flex h-full w-full items-center justify-center">
                                          <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={96}
                                            height={96}
                                            className="object-cover"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex flex-row justify-between">
                                          <div>
                                            <h4 className="text-sm font-medium lg:text-lg">
                                              {item.name}{" "}
                                              <span className="ml-2">x {item.quantity}</span>
                                            </h4>
                                            {item.description && (
                                              <p className="cart-text-base mt-1 text-sm">
                                                {item.description}
                                              </p>
                                            )}
                                          </div>
                                          <button
                                            onClick={() => removeItem(item.id)}
                                            className="mt-2 self-start rounded-lg p-2 sm:mt-0 sm:self-auto"
                                          >
                                            <Trash2 className="text-muted-foreground hover:text-danger h-5 w-5" />
                                          </button>
                                        </div>
                                        <div className="mt-4 flex flex-row items-start justify-between gap-2 sm:items-center sm:gap-0">
                                          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                            {item.discountPercentage && (
                                              <div className="flex items-center gap-2">
                                                <span className="bg-danger-foreground text-danger rounded px-2 py-1 text-sm font-medium">
                                                  {item.discountPercentage}%
                                                </span>
                                                <span className="cart-text-base text-lg line-through">
                                                  Tk {item.originalPrice.toLocaleString("en-BD")}
                                                </span>
                                              </div>
                                            )}
                                            <div className="text-sm font-bold lg:text-lg">
                                              Tk {item.finalPrice.toLocaleString("en-BD")}
                                            </div>
                                          </div>
                                          <div className="cart-border-sec mt-2 flex items-center rounded-lg border sm:mt-0">
                                            <button
                                              onClick={() => updateQuantity(item.id, false)}
                                              className="cursor-pointer px-3 py-1"
                                            >
                                              -
                                            </button>
                                            <span className="px-4 py-1 text-sm lg:text-lg">
                                              {item.quantity}
                                            </span>
                                            <button
                                              onClick={() => updateQuantity(item.id, true)}
                                              className="cursor-pointer px-3 py-1"
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─────────── INFO STEP — only location ─────────── */}
                {activeStep === "info" && (
                  <div className="bg-card-primary rounded-lg p-4 shadow-sm lg:p-8">
                    <h2 className="mb-6 text-2xl font-bold">Delivery Address</h2>

                    <ShippingInfo
                      street={formData.street}
                      postalCode={formData.postalCode}
                      onLocationChange={handleLocationChange}
                      errors={formErrors}
                      setTouched={setTouched}
                    />
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
                          <button className="bg-success text-success-foreground flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2 transition">
                            <Truck size={18} />
                            <span>Track Order</span>
                          </button>
                        </Link>
                        <Link href="/">
                          <button className="border-success text-success-foreground flex cursor-pointer items-center gap-2 rounded-lg border px-5 py-2 transition">
                            <ShoppingCart size={18} />
                            <span>Continue Shopping</span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-card-primary flex items-center justify-center space-x-4 rounded-xl p-4 shadow">
              <Shield size={24} />
              <span className="text-muted-foreground text-center text-sm font-medium sm:text-base">
                Secure Checkout • 256-bit SSL Encryption • Your information is safe
              </span>
            </div>
          </div>

          {/* ─────────── Right Column - Order Summary ─────────── */}
          <div className={`mt-3 lg:mt-0 lg:w-4/12 ${activeStep === "payment" ? "hidden" : ""}`}>
            <div>
              <div className="bg-primary mb-3 rounded-xl p-4">
                <div className="flex items-center text-white">
                  <Truck className="mr-3 h-6 w-6" />
                  <p className="font-semibold">Order Details</p>
                </div>
              </div>

              {/* Promo Code */}
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
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError("");
                        }}
                        placeholder="Enter promo code"
                        className="cart-border-sec focus:ring-button-secondary flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none lg:text-lg"
                      />
                      <button
                        onClick={applyPromoCode}
                        className="bg-button-primary cursor-pointer rounded-lg px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <p className="text-danger mt-2 text-sm">{promoError}</p>}
                    <p className="text-muted-foreground mt-2 text-xs">
                      Valid codes: SAVE10, DISCOUNT10, PROMO10 (10% off)
                    </p>
                  </div>
                ) : (
                  <div className="bg-success border-success rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-success-foreground font-medium">{appliedPromoCode}</p>
                        <p className="text-success-foreground text-sm">10% discount applied</p>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-danger hover:text-danger/80 cursor-pointer text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Vouchers */}
              <div className="bg-card-primary mb-3 rounded-xl p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold lg:text-lg">Available Offers</h3>
                  <Tag className="text-button-secondary h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium lg:text-lg">
                    There are {vouchers.length} Vouchers for you
                  </p>
                  {vouchers.map((voucher) => {
                    const canApply = totals.totalPrice >= voucher.minPurchase;
                    return (
                      <div key={voucher.id}>
                        {canApply ? (
                          <div
                            className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${offerInfo.status === "active"
                              ? "bg-success text-success-foreground border-success/30 border"
                              : "bg-muted text-muted-foreground border-border border"
                              }`}
                          >
                            {offerInfo.status === "active" ? (
                              <Check size={16} />
                            ) : (
                              <Lock size={16} />
                            )}
                            <span>{offerInfo.message}</span>
                          </div>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <div className="bg-muted text-muted-foreground border-border mb-4 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm">
                                <Lock size={16} />
                                <span>{offerInfo.message}</span>
                              </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Minimum Purchase Required</AlertDialogTitle>
                                <AlertDialogDescription>
                                  You need to spend at least Tk{" "}
                                  {voucher.minPurchase.toLocaleString("en-BD")} to use this voucher.
                                  Your current total is Tk{" "}
                                  {totals.totalPrice.toLocaleString("en-BD")}. Please add Tk{" "}
                                  {(voucher.minPurchase - totals.totalPrice).toLocaleString(
                                    "en-BD"
                                  )}{" "}
                                  more to unlock.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Okay</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-card-primary rounded-xl p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold lg:text-lg">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Price ({cartItems.filter((i) => i.selected).length} products)
                    </span>
                    <span className="text-sm font-medium lg:text-lg">
                      Tk {totals.totalPrice.toLocaleString("en-BD")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <div className="text-right">
                      {totals.shippingFee === 0 && totals.fullShippingFee > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm line-through">
                            Tk {totals.fullShippingFee.toLocaleString("en-BD")}
                          </span>
                          <span className="text-success-foreground font-medium">Free</span>
                        </div>
                      ) : totals.savedShippingFee > 0 ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm line-through">
                              Tk {totals.fullShippingFee.toLocaleString("en-BD")}
                            </span>
                            <span className="text-sm font-medium lg:text-lg">
                              Tk {totals.shippingFee.toLocaleString("en-BD")}
                            </span>
                          </div>
                          <span className="text-success-foreground text-xs">
                            Saved Tk {totals.savedShippingFee.toLocaleString("en-BD")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium lg:text-lg">
                          Tk {totals.shippingFee.toLocaleString("en-BD")}
                        </span>
                      )}
                    </div>
                  </div>
                  {appliedPromoCode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Promo Code Discount</span>
                      <span className="text-danger font-medium">
                        - Tk {totals.promoDiscount.toLocaleString("en-BD")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Discount</span>
                    <span className="text-danger font-medium">
                      - Tk {totals.totalDiscount.toLocaleString("en-BD")}
                    </span>
                  </div>
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
                            Please select Country, Division, District, Thana and fill in your Street
                            before placing the order.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Okay</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (activeStep === "items") {
                          setCompletedSteps((prev) => new Set(prev).add("items"));
                          setActiveStep("info");
                        } else if (activeStep === "info") {
                          await handlePlaceOrder();
                        }
                      }}
                      disabled={isOrdering}
                      className="bg-button-primary mt-6 w-full transform cursor-pointer rounded-lg px-4 py-3 font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                    >
                      {activeStep === "items" &&
                        `Proceed to Address (${cartItems.filter((i) => i.selected).length})`}
                      {activeStep === "info" && (isOrdering ? "Placing Order..." : "Place Order")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
