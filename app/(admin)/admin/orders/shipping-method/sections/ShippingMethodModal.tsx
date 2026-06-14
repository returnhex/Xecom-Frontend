"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { shippingMethodSchema, TShippingMethodFormData } from "@/lib/shipping-method.schema";
import {
  useAddShippingMethodMutation,
  useUpdateShippingMethodMutation,
} from "@/redux/features/order/shipping-method.api";

import { TShippingMethod } from "@/types/order.type";

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
import { Loader2 } from "lucide-react";

interface ShippingMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shippingMethod?: TShippingMethod | null;
}

export default function ShippingMethodModal({
  open,
  onOpenChange,
  shippingMethod,
}: ShippingMethodModalProps) {
  const isEditMode = !!shippingMethod;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TShippingMethodFormData>({
    resolver: zodResolver(shippingMethodSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      cost: undefined,
      estimatedDays: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  const [addShippingMethod, { isLoading: isAdding }] = useAddShippingMethodMutation();
  const [updateShippingMethod, { isLoading: isUpdating }] = useUpdateShippingMethodMutation();

  useEffect(() => {
    if (shippingMethod && open) {
      setValue("code", shippingMethod.code);
      setValue("name", shippingMethod.name);
      setValue("description", shippingMethod.description ?? "");
      setValue("cost", shippingMethod.cost ? Number(shippingMethod.cost) : undefined);
      setValue("estimatedDays", shippingMethod.estimatedDays ?? "");
      setValue("isActive", shippingMethod.isActive);
    } else if (!open) {
      reset();
    }
  }, [shippingMethod, open, setValue, reset]);

  const onSubmit = async (data: TShippingMethodFormData) => {
    try {
      let result;

      if (isEditMode && shippingMethod) {
        result = await updateShippingMethod({
          id: shippingMethod.id,
          data: {
            code: data.code,
            name: data.name,
            description: data.description,
            cost: data.cost,
            estimatedDays: data.estimatedDays,
            isActive: data.isActive,
          },
        }).unwrap();

        toast.success(result?.message || "Shipping method updated successfully");
      } else {
        result = await addShippingMethod({
          code: data.code,
          name: data.name,
          description: data.description,
          cost: data.cost,
          estimatedDays: data.estimatedDays,
        }).unwrap();

        toast.success(result?.message || "Shipping method added successfully");
      }

      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to save shipping method");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Shipping Method" : "Add Shipping Method"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the shipping method details below"
              : "Enter the details to create a new shipping method"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" placeholder="e.g. Standard Delivery" {...register("name")} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          {/* Code */}
          <div>
            <Label htmlFor="code">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input id="code" placeholder="e.g. STANDARD" {...register("code")} />
            {errors.code && <p className="text-destructive text-sm">{errors.code.message}</p>}
          </div>

          {/* Cost */}
          <div>
            <Label htmlFor="cost">
              Cost <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              placeholder="e.g. 60"
              {...register("cost", {
                setValueAs: (v) =>
                  v === "" || v === null || v === undefined ? undefined : Number(v),
              })}
            />
            {errors.cost && <p className="text-destructive text-sm">{errors.cost.message}</p>}
          </div>

          {/* Estimated Days */}
          <div>
            <Label htmlFor="estimatedDays">
              Estimated Days <span className="text-destructive">*</span>
            </Label>
            <Input id="estimatedDays" placeholder="e.g. 3-5 days" {...register("estimatedDays")} />
            {errors.estimatedDays && (
              <p className="text-destructive text-sm">{errors.estimatedDays.message}</p>
            )}
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
                <p className="text-muted-foreground text-xs">
                  Inactive methods are hidden at checkout
                </p>
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
