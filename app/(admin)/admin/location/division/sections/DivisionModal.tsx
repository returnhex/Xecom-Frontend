"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { divisionSchema, TDivisionFormData } from "@/lib/division.schema";
import {
  useAddDivisionMutation,
  useUpdateDivisionMutation,
} from "@/redux/features/location/division.api";
import { useGetAllCountriesQuery } from "@/redux/features/location/country.api";

import { TDivision } from "@/types/location.type";
import { API_URL } from "@/redux/api/baseApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  division?: TDivision | null;
}

export default function DivisionModal({ open, onOpenChange, division }: Props) {
  const isEditMode = !!division;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TDivisionFormData>({
    resolver: zodResolver(divisionSchema),
    defaultValues: {
      name: "",
      countryId: "",
    },
  });

  const { data: countryData } = useGetAllCountriesQuery([
    { name: "fields", value: "id" },
    { name: "fields", value: "name" },
  ]);
  const countries = countryData?.data || [];

  const [selectedCountry, setSelectedCountry] = useState<SelectOption[]>([]);

  const [addDivision, { isLoading: isAdding }] = useAddDivisionMutation();
  const [updateDivision, { isLoading: isUpdating }] = useUpdateDivisionMutation();

  // Prefill form on edit
  useEffect(() => {
    if (division && open) {
      setValue("name", division.name);
      setValue("countryId", division.countryId);

      const countryOption = countries
        .map((c) => ({ value: c.id, label: c.name }))
        .find((c) => c.value === division.countryId);

      setSelectedCountry(countryOption ? [countryOption] : []);
    } else {
      reset();
      setSelectedCountry([]);
    }
  }, [division, open, countries, setValue, reset]);

  const onSubmit = async (data: TDivisionFormData) => {
    try {
      if (isEditMode && division) {
        await updateDivision({
          id: division.id,
          data: {
            id: division.id,
            name: data.name,
            countryId: data.countryId,
          },
        }).unwrap();

        toast.success("Division updated successfully");
      } else {
        await addDivision(data).unwrap();
        toast.success("Division added successfully");
      }

      reset();
      setSelectedCountry([]);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save division");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Division" : "Add Division"}</DialogTitle>
          <DialogDescription>Manage division under selected country</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Country Select */}
          <div>
            <Label>Country *</Label>
            <Controller
              name="countryId"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  endpoint={`${API_URL}/country`}
                  fields={["id", "name"]}
                  mapToOption={(item) => ({ value: item.id, label: item.name })}
                  value={selectedCountry}
                  onChange={(vals) => {
                    setSelectedCountry(vals as SelectOption[]);
                    field.onChange(vals[0]?.value ?? "");
                  }}
                  searchable
                  paginated
                  placeholder="Select Country"
                />
              )}
            />
            {errors.countryId && (
              <p className="text-destructive text-sm">{errors.countryId.message}</p>
            )}
          </div>

          {/* Division Name */}
          <div>
            <Label>Division Name *</Label>
            <Input placeholder="Enter division name" {...register("name")} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isAdding || isUpdating ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
