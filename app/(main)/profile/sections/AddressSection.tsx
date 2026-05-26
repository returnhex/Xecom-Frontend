"use client";

import React, { useState, useEffect } from "react";
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
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption | null>(null);
  const [selectedThana, setSelectedThana] = useState<SelectOption | null>(null);

  // Sync selected options with formData when externally updated
  useEffect(() => {
    if (!formData.country) setSelectedCountry(null);
    if (!formData.division) setSelectedDivision(null);
    if (!formData.district) setSelectedDistrict(null);
    if (!formData.thana) setSelectedThana(null);
  }, [formData.country, formData.division, formData.district, formData.thana]);

  const handleCustomChange = (name: string, value: string) => {
    handleChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  const handleCountryChange = (value: SelectOption | SelectOption[] | null) => {
    const option = value as SelectOption | null;
    setSelectedCountry(option);
    const countryId = option?.value?.toString() || "";
    handleCustomChange("country", countryId);
  };

  const handleDivisionChange = (value: SelectOption | SelectOption[] | null) => {
    const option = value as SelectOption | null;
    setSelectedDivision(option);
    const divisionId = option?.value?.toString() || "";
    handleCustomChange("division", divisionId);
  };

  const handleDistrictChange = (value: SelectOption | SelectOption[] | null) => {
    const option = value as SelectOption | null;
    setSelectedDistrict(option);
    const districtId = option?.value?.toString() || "";
    handleCustomChange("district", districtId);
  };

  const handleThanaChange = (value: SelectOption | SelectOption[] | null) => {
    const option = value as SelectOption | null;
    setSelectedThana(option);
    const thanaId = option?.value?.toString() || "";
    handleCustomChange("thana", thanaId);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className="bg-card-primary border-border rounded-lg border shadow-sm"
    >
      <div className="border-border border-b bg-linear-to-r from-transparent to-black/2 p-6">
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
              onChange={handleCountryChange}
              searchable
              paginated
              loadingStyle="eager"
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
              onChange={handleDivisionChange}
              searchable
              paginated
              loadingStyle="eager"
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
              onChange={handleDistrictChange}
              searchable
              paginated
              loadingStyle="eager"
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
              onChange={handleThanaChange}
              searchable
              paginated
              loadingStyle="eager"
              placeholder="Select Thana"
            />
          </motion.div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-button-primary text-button-primary-foreground flex min-w-40 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all disabled:opacity-70"
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
