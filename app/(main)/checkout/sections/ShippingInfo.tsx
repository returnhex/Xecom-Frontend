"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/redux/api/baseApi";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";

interface ShippingInfoProps {
  street: string;
  postalCode: string;
  onLocationChange: (data: { thanaId: string; street: string; postalCode: string }) => void;
  setTouched: React.Dispatch<any>;
  errors?: {
    thanaId?: string;
    street?: string;
    postalCode?: string;
  };
}

const ShippingInfo = ({
  street,
  postalCode,
  onLocationChange,
  setTouched,
  errors = {},
}: ShippingInfoProps) => {
  const [selectedCountry, setSelectedCountry] = useState<SelectOption[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption[]>([]);
  const [selectedThana, setSelectedThana] = useState<SelectOption[]>([]);

  const countryId = selectedCountry[0]?.value ?? "";
  const divisionId = selectedDivision[0]?.value ?? "";
  const districtId = selectedDistrict[0]?.value ?? "";

  const notify = (overrides?: { thanaId?: string; street?: string; postalCode?: string }) => {
    onLocationChange({
      thanaId: overrides?.thanaId ?? String(selectedThana[0]?.value ?? ""),
      street: overrides?.street ?? street,
      postalCode: overrides?.postalCode ?? postalCode,
    });
  };

  const handleCountryChange = (vals: SelectOption[] | null) => {
    const safeVals = vals ?? [];
    setSelectedCountry(safeVals);
    setSelectedDivision([]);
    setSelectedDistrict([]);
    setSelectedThana([]);
    notify({ thanaId: "" });
  };

  const handleDivisionChange = (vals: SelectOption[] | null) => {
    const safeVals = vals ?? [];
    setSelectedDivision(safeVals);
    setSelectedDistrict([]);
    setSelectedThana([]);
    notify({ thanaId: "" });
  };

  const handleDistrictChange = (vals: SelectOption[] | null) => {
    const safeVals = vals ?? [];
    setSelectedDistrict(safeVals);
    setSelectedThana([]);
    notify({ thanaId: "" });
  };

  const handleThanaChange = (vals: SelectOption[] | null) => {
    const safeVals = vals ?? [];
    setSelectedThana(safeVals);

    const newThanaId = String(safeVals[0]?.value ?? "");

    notify({ thanaId: newThanaId });

    setTouched((prev: any) => ({ ...prev, thanaId: true }));
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    notify({ street: e.target.value });

    setTouched((prev: any) => ({ ...prev, street: true }));
  };

  const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    notify({ postalCode: e.target.value });
  };

  return (
    <div className="my-2 space-y-3">
      <label className="flex items-center text-sm font-medium">
        <MapPin size={16} className="mr-2" />
        Delivery Location *
      </label>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
            onChange={handleCountryChange}
            searchable
            paginated
          />
        </div>

        <div>
          <Label>Division</Label>
          <CustomSelect
            key={`division-${countryId}`}
            endpoint={`${API_URL}/division`}
            fields={["id", "name"]}
            extraParams={countryId ? { countryId } : {}}
            mapToOption={(item) => ({
              value: String(item.id),
              label: item.name,
            })}
            value={selectedDivision}
            onChange={handleDivisionChange}
            searchable
            paginated
          />
        </div>

        <div>
          <Label>District</Label>
          <CustomSelect
            key={`district-${divisionId}`}
            endpoint={`${API_URL}/district`}
            fields={["id", "name"]}
            extraParams={divisionId ? { divisionId } : {}}
            mapToOption={(item) => ({
              value: String(item.id),
              label: item.name,
            })}
            value={selectedDistrict}
            onChange={handleDistrictChange}
            searchable
            paginated
          />
        </div>

        <div>
          <Label>Thana *</Label>
          <CustomSelect
            key={`thana-${districtId}`}
            endpoint={`${API_URL}/thana`}
            fields={["id", "name"]}
            extraParams={districtId ? { districtId } : {}}
            mapToOption={(item) => ({
              value: String(item.id),
              label: item.name,
            })}
            value={selectedThana}
            onChange={handleThanaChange}
            searchable
            paginated
          />
          {errors.thanaId && <p className="text-danger mt-1 text-sm">{errors.thanaId}</p>}
        </div>

        <div>
          <Label>Street *</Label>
          <Input
            value={street}
            onChange={handleStreetChange}
            className={errors.street ? "border-danger" : ""}
          />
          {errors.street && <p className="text-danger mt-1 text-sm">{errors.street}</p>}
        </div>

        <div>
          <Label>Postal Code</Label>
          <Input value={postalCode} onChange={handlePostalChange} />
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
