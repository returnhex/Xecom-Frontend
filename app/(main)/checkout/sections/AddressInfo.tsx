"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { API_URL } from "@/redux/api/baseApi";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { useGetUserAddressesQuery } from "@/redux/features/user/user.api";
import { TUserAddress } from "@/redux/features/user/dto/user.dto";

export type TOrderAddressPayload =
  | { addressId: string; thanaId?: never; street?: never; postalCode?: never; isDefault?: never }
  | {
      addressId?: never;
      thanaId?: string;
      street?: string;
      postalCode?: string;
      isDefault?: boolean;
    };

interface AddressInfoProps {
  onLocationChange: (data: TOrderAddressPayload) => void;
}

const toArray = (val: SelectOption | SelectOption[] | null): SelectOption[] => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

const AddressInfo = ({ onLocationChange }: AddressInfoProps) => {
  const { data: addressesData } = useGetUserAddressesQuery(undefined);
  const addresses: TUserAddress[] = addressesData?.data ?? [];

  // thanaId is always present — used to identify which address is active in the list
  const [activeThanaId, setActiveThanaId] = useState<string | null>(null);
  // id may be undefined if the backend doesn't return it — used only for the order payload
  const [activeAddressId, setActiveAddressId] = useState<string | null>(null);
  const [cascadeKey, setCascadeKey] = useState(0);

  const [selectedCountry, setSelectedCountry] = useState<SelectOption[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption[]>([]);
  const [selectedThana, setSelectedThana] = useState<SelectOption[]>([]);
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const initialized = useRef(false);
  const filling = useRef(false);

  const markManual = () => {
    if (filling.current) return;
    setActiveThanaId(null);
    setActiveAddressId(null);
  };

  const fillFromAddress = (addr: TUserAddress) => {
    filling.current = true;
    setSelectedCountry([{ value: addr.countryId, label: addr.countryName }]);
    setSelectedDivision([{ value: addr.divisionId, label: addr.divisionName }]);
    setSelectedDistrict([{ value: addr.districtId, label: addr.districtName }]);
    setSelectedThana([{ value: addr.thanaId, label: addr.thanaName }]);
    setStreet(addr.street);
    setPostalCode(String(addr.postalCode ?? ""));
    setActiveThanaId(addr.thanaId);
    setActiveAddressId(addr.id ?? null);
    setCascadeKey((k) => k + 1);
    // Reset after the current render cycle finishes so any onChange
    // calls triggered by CustomSelect remounting are still suppressed.
    setTimeout(() => {
      filling.current = false;
    }, 0);
  };

  // Pre-fill from default address once on load
  useEffect(() => {
    if (initialized.current || !addresses.length) return;
    initialized.current = true;
    const def = addresses.find((a) => a.isDefault);
    if (def) fillFromAddress(def);
  }, [addresses]);

  // Notify parent on any change
  useEffect(() => {
    if (activeAddressId) {
      onLocationChange({ addressId: activeAddressId });
    } else {
      onLocationChange({
        thanaId: (selectedThana[0]?.value as string) || undefined,
        street: street || undefined,
        postalCode: postalCode || undefined,
        isDefault: isDefault || undefined,
      });
    }
  }, [activeAddressId, activeThanaId, selectedThana, street, postalCode, isDefault]);

  const activeAddress = addresses.find((a) => a.thanaId === activeThanaId);

  // Exclude whichever address is currently shown in the form fields.
  // Before the init effect fires (activeThanaId still null), fall back to
  // excluding the default so it never flashes into the list.
  const otherAddresses = addresses.filter((a) => {
    if (activeThanaId) return a.thanaId !== activeThanaId;
    return !a.isDefault;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold tracking-tight">Delivery Address</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {activeThanaId ? "Using your saved address" : "Enter a delivery address"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        {/* Country */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Country *</Label>
          <CustomSelect
            key={`country-${cascadeKey}`}
            endpoint={`${API_URL}/country`}
            fields={["id", "name"]}
            mapToOption={(item) => ({ value: String(item.id), label: item.name })}
            value={selectedCountry}
            onChange={(vals) => {
              setSelectedCountry(toArray(vals));
              setSelectedDivision([]);
              setSelectedDistrict([]);
              setSelectedThana([]);
              markManual();
            }}
            searchable
            paginated
            placeholder="Select country"
          />
        </div>

        {/* Division */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Division *</Label>
          <CustomSelect
            key={`division-${cascadeKey}-${selectedCountry[0]?.value ?? ""}`}
            endpoint={`${API_URL}/division`}
            fields={["id", "name"]}
            extraParams={selectedCountry[0]?.value ? { countryId: selectedCountry[0].value } : {}}
            mapToOption={(item) => ({ value: String(item.id), label: item.name })}
            value={selectedDivision}
            onChange={(vals) => {
              setSelectedDivision(toArray(vals));
              setSelectedDistrict([]);
              setSelectedThana([]);
              markManual();
            }}
            searchable
            paginated
            placeholder={selectedCountry[0]?.value ? "Select division" : "Select country first"}
          />
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">District *</Label>
          <CustomSelect
            key={`district-${cascadeKey}-${selectedDivision[0]?.value ?? ""}`}
            endpoint={`${API_URL}/district`}
            fields={["id", "name"]}
            extraParams={
              selectedDivision[0]?.value
                ? {
                    countryId: selectedCountry[0]?.value,
                    divisionId: selectedDivision[0].value,
                  }
                : {}
            }
            mapToOption={(item) => ({ value: String(item.id), label: item.name })}
            value={selectedDistrict}
            onChange={(vals) => {
              setSelectedDistrict(toArray(vals));
              setSelectedThana([]);
              markManual();
            }}
            searchable
            paginated
            placeholder={selectedDivision[0]?.value ? "Select district" : "Select division first"}
          />
        </div>

        {/* Thana */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Area / Thana *</Label>
          <CustomSelect
            key={`thana-${cascadeKey}-${selectedDistrict[0]?.value ?? ""}`}
            endpoint={`${API_URL}/thana`}
            fields={["id", "name"]}
            extraParams={
              selectedDistrict[0]?.value
                ? {
                    countryId: selectedCountry[0]?.value,
                    divisionId: selectedDivision[0]?.value,
                    districtId: selectedDistrict[0].value,
                  }
                : {}
            }
            mapToOption={(item) => ({ value: String(item.id), label: item.name })}
            value={selectedThana}
            onChange={(vals) => {
              setSelectedThana(toArray(vals));
              markManual();
            }}
            searchable
            paginated
            placeholder={selectedDistrict[0]?.value ? "Select area" : "Select district first"}
          />
        </div>

        {/* Street */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Street / Area *</Label>
          <Input
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              markManual();
            }}
            placeholder="House, road, block"
            className="border-border bg-card-primary h-10 text-xs"
          />
        </div>

        {/* Postal Code */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Postal Code</Label>
          <Input
            value={postalCode}
            onChange={(e) => {
              setPostalCode(e.target.value);
              markManual();
            }}
            placeholder="Postal code"
            className="border-border bg-card-primary h-10 text-xs"
          />
        </div>
      </div>

      {/* Save as default — hidden when the active saved address is already default */}
      {!activeAddress?.isDefault && (
        <div className="flex items-center gap-2">
          <Checkbox id="isDefault" checked={isDefault} onCheckedChange={(c) => setIsDefault(!!c)} />
          <label
            htmlFor="isDefault"
            className="text-foreground cursor-pointer text-xs font-medium select-none"
          >
            Save as default address
          </label>
        </div>
      )}

      {/* Other saved addresses */}
      {otherAddresses.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Change address to
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {otherAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => fillFromAddress(addr)}
                className="border-border bg-card-primary hover:border-button-primary flex cursor-pointer items-start gap-2 rounded-xl border p-4 text-left transition-all hover:shadow-sm"
              >
                <MapPin size={13} className="text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-foreground text-xs font-semibold">
                    {addr.thanaName}, {addr.districtName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {addr.divisionName}, {addr.countryName}
                  </p>
                  <p className="text-muted-foreground text-xs">{addr.street}</p>
                  {addr.postalCode ? (
                    <p className="text-muted-foreground text-xs">Postal: {addr.postalCode}</p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressInfo;
