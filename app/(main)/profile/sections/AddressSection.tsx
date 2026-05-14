"use client";

import React from "react";
import { TQueryParam } from "@/types";
import { useGetAllCountriesQuery } from "@/redux/features/location/country.api";
import { useGetAllDivisonQuery } from "@/redux/features/location/division.api";
import { useGetAllDistrictQuery } from "@/redux/features/location/district.api";
import { useGetAllThanasQuery } from "@/redux/features/location/thana.api";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { API_URL } from "@/redux/api/baseApi";

interface AddressSectionProps {
  formData: {
    country: string;
    division: string;
    district: string;
    thana: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const AddressSection = ({ formData, handleChange }: AddressSectionProps) => {
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
    <div className="mb-6">
      <h2 className="mb-4 text-lg font-semibold">Address Information</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Country */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Country</label>
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
        </div>

        {/* Division */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Division</label>
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
            disabled={!formData.country}
          />
        </div>

        {/* District */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">District</label>
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
            disabled={!formData.division}
          />
        </div>

        {/* Thana */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Thana</label>
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
            disabled={!formData.district}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressSection;
