"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CartItemsProps {
  cartItems: CartItemApi[];
  isLoading: boolean;
  updatingItems: Set<string>;
  getQty: (item: CartItemApi) => number;
  onUpdateQuantity: (item: CartItemApi, inc: boolean) => Promise<void>;
  onSetQuantity: (item: CartItemApi, qty: number) => Promise<void>;
  onRemoveItem: (cartItemId: string) => Promise<void>;
}

const CartItems = ({
  cartItems,
  isLoading,
  updatingItems,
  getQty,
  onUpdateQuantity,
  onSetQuantity,
  onRemoveItem,
}: CartItemsProps) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const getInputValue = (item: CartItemApi) => inputValues[item.id] ?? String(getQty(item));

  const handleInputChange = (item: CartItemApi, value: string) => {
    setInputValues((prev) => ({ ...prev, [item.id]: value }));
  };

  const commitInput = async (item: CartItemApi) => {
    const raw = inputValues[item.id];
    if (raw === undefined) return;

    const parsed = parseInt(raw, 10);
    const clamped = isNaN(parsed)
      ? getQty(item)
      : Math.max(1, Math.min(parsed, item.variant.stockQuantity));

    setInputValues((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });

    if (clamped !== getQty(item)) {
      await onSetQuantity(item, clamped);
    }
  };

  const groupedItems = cartItems.reduce(
    (groups, item) => {
      const storeName = item.variant?.product?.store?.name ?? "Store";
      groups[storeName] = groups[storeName] || [];
      groups[storeName].push(item);
      return groups;
    },
    {} as Record<string, CartItemApi[]>
  );

  if (isLoading) {
    return (
      <div className="bg-card-primary flex items-center justify-center rounded-xl p-12">
        <div className="border-button-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-card-primary rounded-xl p-12 text-center">
        <ShoppingCart className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
        <p className="text-muted-foreground text-sm">Your cart is empty.</p>
        <Link
          href="/"
          className="text-button-primary mt-2 inline-block text-sm font-medium hover:underline"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(groupedItems).map(([store, items]) => (
        <div key={store} className="bg-card-primary mb-3 overflow-hidden rounded-xl px-2 shadow-sm">
          <Accordion type="single" collapsible defaultValue={store}>
            <AccordionItem value={store}>
              <AccordionTrigger>
                <div className="p-2">
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold lg:text-xl">{store}</h3>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="cart-border-primary border-border divide-y border-t">
                  {items.map((item) => {
                    const product = item.variant?.product;
                    const imageUrl = product?.images?.[0]?.imageUrl ?? "/placeholder.png";
                    const finalPrice = Number(item.variant.discountPrice ?? item.variant.price);
                    const originalPrice = Number(item.variant.price);
                    const hasDiscount =
                      item.variant.discountPrice != null &&
                      Number(item.variant.discountPrice) < originalPrice;
                    const discountPct = hasDiscount
                      ? Math.round((1 - finalPrice / originalPrice) * 100)
                      : 0;
                    const qty = getQty(item);
                    const isUpdating = updatingItems.has(item.id);

                    return (
                      <div key={item.id} className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="cart-img-bg-primary h-24 w-full shrink-0 overflow-hidden rounded-lg sm:w-24">
                            <div className="flex h-full w-full items-center justify-center">
                              <Image
                                src={imageUrl}
                                alt={product?.name ?? "Product"}
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
                                  {product?.name ?? "Product"}
                                </h4>
                                {product?.description && (
                                  <p className="cart-text-base mt-1 text-sm">
                                    {product.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="mt-2 self-start rounded-lg p-2 sm:mt-0 sm:self-auto"
                              >
                                <Trash2 className="text-muted-foreground hover:text-danger h-5 w-5" />
                              </button>
                            </div>
                            <div className="mt-4 flex flex-row items-start justify-between gap-2 sm:items-center sm:gap-0">
                              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                {hasDiscount && (
                                  <div className="flex items-center gap-2">
                                    <span className="bg-danger-foreground text-danger rounded px-2 py-1 text-sm font-medium">
                                      {discountPct}%
                                    </span>
                                    <span className="cart-text-base text-lg line-through">
                                      Tk {originalPrice.toLocaleString("en-BD")}
                                    </span>
                                  </div>
                                )}
                                <div className="text-sm font-bold lg:text-lg">
                                  Tk {(finalPrice * qty).toLocaleString("en-BD")}
                                </div>
                              </div>
                              <div className="cart-border-sec mt-2 flex items-center rounded-lg border sm:mt-0">
                                <button
                                  onClick={() => onUpdateQuantity(item, false)}
                                  disabled={isUpdating || qty <= 1}
                                  className="cursor-pointer px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={item.variant.stockQuantity}
                                  value={getInputValue(item)}
                                  onChange={(e) => handleInputChange(item, e.target.value)}
                                  onBlur={() => commitInput(item)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") e.currentTarget.blur();
                                  }}
                                  disabled={isUpdating}
                                  className={`border-border w-12 [appearance:textfield] border-x bg-transparent py-1 text-center text-sm transition-opacity focus:outline-none lg:text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isUpdating ? "opacity-40" : "opacity-100"}`}
                                />
                                <button
                                  onClick={() => onUpdateQuantity(item, true)}
                                  disabled={isUpdating || qty >= item.variant.stockQuantity}
                                  className="cursor-pointer px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  );
};

export default CartItems;
