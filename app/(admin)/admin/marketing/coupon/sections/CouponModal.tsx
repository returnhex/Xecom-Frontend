"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { couponSchema, TCouponFormData } from "@/lib/coupon.schema";
import {
  useAddCouponMutation,
  useUpdateCouponMutation,
} from "@/redux/features/marketing/coupon.api";

import { TCoupon } from "@/types/marketing.type";
import { CouponType } from "@/constants/enum";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CouponModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: TCoupon | null;
}

const couponTypeOptions = [
  { value: CouponType.PERCENTAGE, label: "Percentage" },
  { value: CouponType.FIXED_AMOUNT, label: "Fixed Amount" },
  { value: CouponType.FREE_SHIPPING, label: "Free Shipping" },
  { value: CouponType.BUY_X_GET_Y, label: "Buy X Get Y" },
];

// Turn empty number inputs into undefined instead of NaN for the resolver
const numberSetValueAs = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);

// Convert an ISO string to the value format expected by <input type="datetime-local" />
const toDateTimeLocal = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

// Convert a datetime-local value back to an ISO string for the API
const toIso = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

export default function CouponModal({ open, onOpenChange, coupon }: CouponModalProps) {
  const isEditMode = !!coupon;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TCouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: CouponType.PERCENTAGE,
      value: undefined,
      minOrderAmount: undefined,
      maxDiscountAmount: undefined,
      usageLimit: undefined,
      userUsageLimit: undefined,
      isActive: true,
      startsAt: "",
      expiresAt: "",
    },
  });

  const type = watch("type");
  const isActive = watch("isActive");

  const [addCoupon, { isLoading: isAdding }] = useAddCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();

  useEffect(() => {
    if (coupon && open) {
      setValue("code", coupon.code);
      setValue("name", coupon.name);
      setValue("description", coupon.description ?? "");
      setValue("type", coupon.type);
      setValue("value", coupon.value ? Number(coupon.value) : undefined);
      setValue("minOrderAmount", coupon.minOrderAmount ? Number(coupon.minOrderAmount) : undefined);
      setValue(
        "maxDiscountAmount",
        coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : undefined
      );
      setValue("usageLimit", coupon.usageLimit ?? undefined);
      setValue("userUsageLimit", coupon.userUsageLimit ?? undefined);
      setValue("isActive", coupon.isActive);
      setValue("startsAt", toDateTimeLocal(coupon.startsAt));
      setValue("expiresAt", toDateTimeLocal(coupon.expiresAt));
    } else if (!open) {
      reset();
    }
  }, [coupon, open, setValue, reset]);

  const onSubmit = async (data: TCouponFormData) => {
    try {
      const payload = {
        code: data.code,
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        usageLimit: data.usageLimit,
        userUsageLimit: data.userUsageLimit,
        startsAt: toIso(data.startsAt),
        expiresAt: toIso(data.expiresAt),
      };

      let result;

      if (isEditMode && coupon) {
        result = await updateCoupon({
          id: coupon.id,
          data: { ...payload, isActive: data.isActive },
        }).unwrap();

        toast.success(result?.message || "Coupon updated successfully");
      } else {
        result = await addCoupon(payload).unwrap();

        toast.success(result?.message || "Coupon added successfully");
      }

      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to save coupon");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the coupon details below"
              : "Enter the details to create a new coupon"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" placeholder="e.g. Summer Sale" {...register("name")} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          {/* Code */}
          <div>
            <Label htmlFor="code">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input id="code" placeholder="e.g. SUMMER20" {...register("code")} />
            {errors.code && <p className="text-destructive text-sm">{errors.code.message}</p>}
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select value={type} onValueChange={(val) => setValue("type", val as CouponType)}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {couponTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-destructive text-sm">{errors.type.message}</p>}
            </div>

            <div>
              <Label htmlFor="value">
                Value <span className="text-destructive">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder={type === CouponType.PERCENTAGE ? "e.g. 20" : "e.g. 100"}
                {...register("value", { setValueAs: numberSetValueAs })}
              />
              {errors.value && <p className="text-destructive text-sm">{errors.value.message}</p>}
            </div>
          </div>

          {/* Min order + Max discount */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="minOrderAmount">Min Order Amount</Label>
              <Input
                id="minOrderAmount"
                type="number"
                step="0.01"
                placeholder="e.g. 500"
                {...register("minOrderAmount", { setValueAs: numberSetValueAs })}
              />
              {errors.minOrderAmount && (
                <p className="text-destructive text-sm">{errors.minOrderAmount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="maxDiscountAmount">Max Discount Amount</Label>
              <Input
                id="maxDiscountAmount"
                type="number"
                step="0.01"
                placeholder="e.g. 200"
                {...register("maxDiscountAmount", { setValueAs: numberSetValueAs })}
              />
              {errors.maxDiscountAmount && (
                <p className="text-destructive text-sm">{errors.maxDiscountAmount.message}</p>
              )}
            </div>
          </div>

          {/* Usage limits */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                placeholder="Total uses"
                {...register("usageLimit", { setValueAs: numberSetValueAs })}
              />
              {errors.usageLimit && (
                <p className="text-destructive text-sm">{errors.usageLimit.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="userUsageLimit">Per User Limit</Label>
              <Input
                id="userUsageLimit"
                type="number"
                placeholder="Uses per user"
                {...register("userUsageLimit", { setValueAs: numberSetValueAs })}
              />
              {errors.userUsageLimit && (
                <p className="text-destructive text-sm">{errors.userUsageLimit.message}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startsAt">Starts At</Label>
              <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
              {errors.startsAt && (
                <p className="text-destructive text-sm">{errors.startsAt.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input id="expiresAt" type="datetime-local" {...register("expiresAt")} />
              {errors.expiresAt && (
                <p className="text-destructive text-sm">{errors.expiresAt.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Short description (optional)"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>

          {/* Active toggle (only in edit mode) */}
          {isEditMode && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="isActive">Active</Label>
                <p className="text-muted-foreground text-xs">Inactive coupons cannot be redeemed</p>
              </div>
              <Switch
                id="isActive"
                checked={!!isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdding || isUpdating}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isAdding || isUpdating}>
              {isAdding || isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
