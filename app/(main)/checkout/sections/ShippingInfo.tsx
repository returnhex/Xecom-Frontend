"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { type CheckoutFormData } from "@/lib/shepping.Schema";
import { useGetAllCountriesQuery } from "@/redux/features/location/country.api";
import { useGetAllDivisonQuery } from "@/redux/features/location/division.api";
import { useGetAllDistrictQuery } from "@/redux/features/location/district.api";
import { useGetAllThanasQuery } from "@/redux/features/location/thana.api";

interface ShippingInfoProps {
  street: string;
  postalCode: string;
  onLocationChange: (data: CheckoutFormData) => void;
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
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption | null>(null);
  const [selectedThana, setSelectedThana] = useState<SelectOption | null>(null);

  const countryId = selectedCountry?.value ?? "";
  const divisionId = selectedDivision?.value ?? "";
  const districtId = selectedDistrict?.value ?? "";

  // Fetch all data
  const { data: countriesData } = useGetAllCountriesQuery([]);
  const { data: divisionsData } = useGetAllDivisonQuery([]);
  const { data: districtsData } = useGetAllDistrictQuery([]);
  const { data: thanasData } = useGetAllThanasQuery([]);

  // Filter data
  const countries = countriesData?.data || [];
  const divisions = divisionsData?.data?.filter(d => !countryId || d.countryId === countryId) || [];
  const districts = districtsData?.data?.filter(d => !divisionId || d.divisionId === divisionId) || [];
  const thanas = thanasData?.data?.filter(t => !districtId || t.districtId === districtId) || [];

  useEffect(() => {
    console.log("ShippingInfo debug:", {
      countryId,
      divisionId,
      districtId,
      countries: countries.length,
      divisions: divisions.length,
      districts: districts.length,
      thanas: thanas.length,
    });
  }, [countryId, divisionId, districtId, countries.length, divisions.length, districts.length, thanas.length]);

  const notify = (overrides?: { thanaId?: string; street?: string; postalCode?: string }) => {
    onLocationChange({
      thanaId: overrides?.thanaId ?? String(selectedThana?.value ?? ""),
      street: overrides?.street ?? street,
      postalCode: overrides?.postalCode ?? postalCode,
    });
  };

  const handleCountryChange = (val: SelectOption | null) => {
    console.log("Country selected:", val);
    setSelectedCountry(val);
    setSelectedDivision(null);
    setSelectedDistrict(null);
    setSelectedThana(null);
    notify({ thanaId: "" });
  };

  const handleDivisionChange = (val: SelectOption | null) => {
    console.log("Division selected:", val);
    setSelectedDivision(val);
    setSelectedDistrict(null);
    setSelectedThana(null);
    notify({ thanaId: "" });
  };

  const handleDistrictChange = (val: SelectOption | null) => {
    console.log("District selected:", val);
    setSelectedDistrict(val);
    setSelectedThana(null);
    notify({ thanaId: "" });
  };

  const handleThanaChange = (val: SelectOption | null) => {
    console.log("Thana selected:", val);
    setSelectedThana(val);
    notify({ thanaId: String(val?.value ?? "") });
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
            options={countries.map(item => ({ value: String(item.id), label: item.name }))}
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
            options={divisions.map(item => ({ value: String(item.id), label: item.name }))}
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
            options={districts.map(item => ({ value: String(item.id), label: item.name }))}
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
            options={thanas.map(item => ({ value: String(item.id), label: item.name }))}
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
