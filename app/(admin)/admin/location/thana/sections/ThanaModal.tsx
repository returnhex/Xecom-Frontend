"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { thanatSchema, TThanaFormData } from "@/lib/thana.schema";

import { useAddThanaMutation, useUpdateThanaMutation } from "@/redux/features/location/thana.api";

import { useGetAllCountriesQuery } from "@/redux/features/location/country.api";
import { useGetAllDivisonQuery } from "@/redux/features/location/division.api";
import { useGetAllDistrictQuery } from "@/redux/features/location/district.api";

import { TThana } from "@/types/location.type";

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
  thana?: TThana | null;
}

export default function ThanaModal({ open, onOpenChange, thana }: Props) {
  const isEditMode = !!thana;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TThanaFormData>({
    resolver: zodResolver(thanatSchema),
    defaultValues: {
      name: "",
      districtId: "",
    },
  });

  const [addThana, { isLoading: isAdding }] = useAddThanaMutation();
  const [updateThana, { isLoading: isUpdating }] = useUpdateThanaMutation();

  const { data: countryData } = useGetAllCountriesQuery([]);
  const { data: divisionData } = useGetAllDivisonQuery([]);
  const { data: districtData } = useGetAllDistrictQuery([]);

  const countries = countryData?.data || [];
  const divisions = divisionData?.data || [];
  const districts = districtData?.data || [];

  const [selectedCountry, setSelectedCountry] = useState<SelectOption[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption[]>([]);

  // Prefill edit
  useEffect(() => {
    if (thana && open) {
      setValue("name", thana.name);
      setValue("districtId", String(thana.districtId));

      const district = districts.find((d) => String(d.id) === String(thana.districtId));
      const division = divisions.find((d) => String(d.id) === String(district?.divisionId));
      const country = countries.find((c) => String(c.id) === String(division?.countryId));

      setSelectedCountry(country ? [{ value: String(country.id), label: country.name }] : []);

      setSelectedDivision(division ? [{ value: String(division.id), label: division.name }] : []);

      setSelectedDistrict(district ? [{ value: String(district.id), label: district.name }] : []);
    } else {
      reset();
      setSelectedCountry([]);
      setSelectedDivision([]);
      setSelectedDistrict([]);
    }
  }, [thana, open]); // countries, divisions, districts, setValue, reset

  const onSubmit = async (data: TThanaFormData) => {
    try {
      if (isEditMode && thana) {
        await updateThana({
          id: thana.id,
          data: {
            id: thana.id,
            name: thana.name,
            districtId: data.districtId,
          },
        }).unwrap();

        toast.success("Thana updated successfully");
      } else {
        await addThana(data).unwrap();
        toast.success("Thana added successfully");
      }

      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save thana");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Thana" : "Add Thana"}</DialogTitle>
          <DialogDescription>
            Manage Thana under selected country , division & district
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Country */}
          <div>
            <Label>Country</Label>

            <CustomSelect
              endpoint={`${API_URL}/country`}
              fields={["id", "name"]}
              mapToOption={(item) => ({
                value: String(item.id),
                label: item.name,
              })}
              value={selectedCountry}
              onChange={(vals) => {
                setSelectedCountry(vals as SelectOption[]);
                setSelectedDivision([]);
                setSelectedDistrict([]);
              }}
              searchable
              paginated
              placeholder="Select Country"
            />
          </div>

          {/* Division */}
          <div>
            <Label>Division</Label>

            <CustomSelect
              endpoint={`${API_URL}/division`}
              fields={["id", "name"]}
              mapToOption={(item) => ({
                value: String(item.id),
                label: item.name,
              })}
              value={selectedDivision}
              onChange={(vals) => {
                setSelectedDivision(vals as SelectOption[]);
                setSelectedDistrict([]);
              }}
              searchable
              paginated
              placeholder="Select Division"
            />
          </div>

          {/* District */}
          <div>
            <Label>District *</Label>

            <CustomSelect
              endpoint={`${API_URL}/district`}
              fields={["id", "name"]}
              mapToOption={(item) => ({
                value: String(item.id),
                label: item.name,
              })}
              value={selectedDistrict}
              onChange={(vals) => {
                const selected = vals as SelectOption[];

                setSelectedDistrict(selected);

                setValue("districtId", String(selected[0]?.value));
              }}
              searchable
              paginated
              placeholder="Select District"
            />

            {errors.districtId && (
              <p className="text-destructive text-sm">{errors.districtId.message}</p>
            )}
          </div>

          {/* Thana Name */}
          <div>
            <Label>Thana Name *</Label>

            <Input placeholder="Enter thana name" {...register("name")} />

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
