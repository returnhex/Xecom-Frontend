"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { districtSchema, TDistrictFormData } from "@/lib/district.schema";
import {
  useAddDistrictMutation,
  useUpdateDistrictMutation,
} from "@/redux/features/location/district.api";

import { TDistrict } from "@/types/location.type";
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
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  district?: TDistrict | null;
}

export default function DistrictModal({ open, onOpenChange, district }: Props) {
  const isEditMode = !!district;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TDistrictFormData>({
    resolver: zodResolver(districtSchema),
    defaultValues: {
      name: "",
      divisionId: "",
    },
  });

  const [addDistrict, { isLoading: isAdding }] = useAddDistrictMutation();
  const [updateDistrict, { isLoading: isUpdating }] = useUpdateDistrictMutation();

  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption | null>(null);

  // Prefill form on edit
  useEffect(() => {
    if (district && open) {
      setValue("name", district.name);
      setValue("divisionId", district.divisionId);
      setSelectedDivision({
        value: district.divisionId,
        label: district.divisionId,
      });
    } else {
      reset();
      setSelectedCountry(null);
      setSelectedDivision(null);
    }
  }, [district, open, setValue, reset]);

  const onSubmit = async (data: TDistrictFormData) => {
    try {
      if (isEditMode && district) {
        await updateDistrict({
          id: district.id,
          data: {
            id: district.id,
            name: data.name,
            divisionId: data.divisionId,
          },
        }).unwrap();
        toast.success("District updated successfully");
      } else {
        await addDistrict(data).unwrap();
        toast.success("District added successfully");
      }
      reset();
      setSelectedCountry(null);
      setSelectedDivision(null);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save district");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit District" : "Add District"}</DialogTitle>
          <DialogDescription>Manage district under selected country & division</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Country Select */}
          <div>
            <Label>Country</Label>
            <CustomSelect
              endpoint={`${API_URL}/country`}
              fields={["id", "name"]}
              mapToOption={(item) => ({ value: item.id, label: item.name })}
              value={selectedCountry}
              onChange={(val) => {
                const option = val as SelectOption | null;
                setSelectedCountry(option);
                setSelectedDivision(null);
                setValue("divisionId", "");
              }}
              searchable
              paginated
              loadingStyle="eager"
              placeholder="Select Country"
            />
          </div>

          {/* Division Select */}
          <div>
            <Label>Division *</Label>
            <CustomSelect
              endpoint={`${API_URL}/division`}
              fields={["id", "name"]}
              extraParams={{ countryId: selectedCountry?.value?.toString() || "" }}
              mapToOption={(item) => ({
                value: item.id,
                label: item.name,
              })}
              value={selectedDivision}
              onChange={(val) => {
                const option = val as SelectOption | null;
                setSelectedDivision(option);
                setValue("divisionId", option?.value?.toString() || "");
              }}
              searchable
              paginated
              loadingStyle="eager"
              placeholder="Select Division"
            />
            {errors.divisionId && (
              <p className="text-destructive text-sm">{errors.divisionId.message}</p>
            )}
          </div>

          {/* District Name */}
          <div>
            <Label>District Name *</Label>
            <Input placeholder="Enter district name" {...register("name")} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
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
