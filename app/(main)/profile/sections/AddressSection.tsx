"use client";

import React from "react";
import { TQueryParam } from "@/types";
import { useGetAllCountriesQuery } from "@/redux/features/location/country.api";
import { useGetAllDivisonQuery } from "@/redux/features/location/division.api";
import { useGetAllDistrictQuery } from "@/redux/features/location/district.api";
import { useGetAllThanasQuery } from "@/redux/features/location/thana.api";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { API_URL } from "@/redux/api/baseApi";
import { MapPin, Loader2, Save, Globe, Map, Navigation } from "lucide-react";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface AddressSectionProps {
  formData: {
    country: string;
    division: string;
    district: string;
    thana: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AddressSection = ({ formData, handleChange, loading, onSubmit }: AddressSectionProps) => {
  const { data: countries } = useGetAllCountriesQuery(undefined);

  const { data: divisions } = useGetAllDivisonQuery(
    [{ name: "countryId", value: formData.country }],
    {
      skip: !formData.country,
    }
  );

  const { data: districts } = useGetAllDistrictQuery(
    [
      { name: "countryId", value: formData.country },
      { name: "divisionId", value: formData.division },
    ],
    {
      skip: !formData.division,
    }
  );

  const { data: thanas } = useGetAllThanasQuery(
    [
      { name: "countryId", value: formData.country },
      { name: "divisionId", value: formData.division },
      { name: "districtId", value: formData.district },
    ],
    {
      skip: !formData.district,
    }
  );

  const handleCustomChange = (name: string, value: string) => {
    handleChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  const selectedCountry =
    countries?.data
      ?.filter((c: any) => c.id === formData.country)
      .map((c: any) => ({ value: c.id, label: c.name })) || [];

  const selectedDivision =
    divisions?.data
      ?.filter((d: any) => d.id === formData.division)
      .map((d: any) => ({ value: d.id, label: d.name })) || [];

  const selectedDistrict =
    districts?.data
      ?.filter((d: any) => d.id === formData.district)
      .map((d: any) => ({ value: d.id, label: d.name })) || [];

  const selectedThana =
    thanas?.data
      ?.filter((t: any) => t.id === formData.thana)
      .map((t: any) => ({ value: t.id, label: t.name })) || [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className="bg-card-primary border-border overflow-hidden rounded-lg border shadow-sm"
    >
      <div className="border-border border-b bg-linear-to-r from-transparent to-black/[0.02] p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <MapPin className="text-primary h-5 w-5" />
          Address Information
        </h2>
        <p className="text-muted-foreground text-sm">Update your location and shipping details.</p>
      </div>

      <form onSubmit={onSubmit} className="p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Country */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <Label className="flex items-center gap-2">
              <Globe size={14} /> Country
            </Label>
            <CustomSelect
              endpoint={`${API_URL}/country`}
              fields={["id", "name"]}
              mapToOption={(item) => ({ value: item.id, label: item.name })}
              value={selectedCountry}
              onChange={(val) => {
                const v = (val as SelectOption)?.value?.toString() || "";
                handleCustomChange("country", v);
              }}
              searchable
              paginated
              placeholder="Select Country"
            />
          </motion.div>

          {/* Division */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <Label className="flex items-center gap-2">
              <Map size={14} /> Division
            </Label>
            <CustomSelect
              endpoint={`${API_URL}/division`}
              fields={["id", "name"]}
              extraParams={{ countryId: formData.country }}
              mapToOption={(item) => ({ value: item.id, label: item.name })}
              value={selectedDivision}
              onChange={(val) => {
                const v = (val as SelectOption)?.value?.toString() || "";
                handleCustomChange("division", v);
              }}
              searchable
              paginated
              placeholder="Select Division"
            />
          </motion.div>

          {/* District */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <Label className="flex items-center gap-2">
              <Navigation size={14} /> District
            </Label>
            <CustomSelect
              endpoint={`${API_URL}/district`}
              fields={["id", "name"]}
              extraParams={{
                countryId: formData.country,
                divisionId: formData.division,
              }}
              mapToOption={(item) => ({ value: item.id, label: item.name })}
              value={selectedDistrict}
              onChange={(val) => {
                const v = (val as SelectOption)?.value?.toString() || "";
                handleCustomChange("district", v);
              }}
              searchable
              paginated
              placeholder="Select District"
            />
          </motion.div>

          {/* Thana */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <Label className="flex items-center gap-2">
              <MapPin size={14} /> Thana
            </Label>
            <CustomSelect
              endpoint={`${API_URL}/thana`}
              fields={["id", "name"]}
              extraParams={{
                countryId: formData.country,
                divisionId: formData.division,
                districtId: formData.district,
              }}
              mapToOption={(item) => ({ value: item.id, label: item.name })}
              value={selectedThana}
              onChange={(val) => {
                const v = (val as SelectOption)?.value?.toString() || "";
                handleCustomChange("thana", v);
              }}
              searchable
              paginated
              placeholder="Select Thana"
            />
          </motion.div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end pt-4">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-button-primary text-button-primary-foreground flex min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Address
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddressSection;
