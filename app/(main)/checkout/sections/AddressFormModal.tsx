"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { API_URL } from "@/redux/api/baseApi";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";

export type TNewAddressData = {
  countryId: string;
  countryName: string;
  divisionId: string;
  divisionName: string;
  districtId: string;
  districtName: string;
  thanaId: string;
  thanaName: string;
  street: string;
  postalCode?: string;
  isDefault?: boolean;
};

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TNewAddressData) => void;
  initial?: TNewAddressData | null;
}

const toArray = (val: SelectOption | SelectOption[] | null): SelectOption[] => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

const AddressFormModal = ({ open, onClose, onSubmit, initial }: AddressFormModalProps) => {
  const [selectedCountry, setSelectedCountry] = useState<SelectOption[]>(
    initial ? [{ value: initial.countryId, label: initial.countryName }] : []
  );
  const [selectedDivision, setSelectedDivision] = useState<SelectOption[]>(
    initial ? [{ value: initial.divisionId, label: initial.divisionName }] : []
  );
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption[]>(
    initial ? [{ value: initial.districtId, label: initial.districtName }] : []
  );
  const [selectedThana, setSelectedThana] = useState<SelectOption[]>(
    initial ? [{ value: initial.thanaId, label: initial.thanaName }] : []
  );
  const [street, setStreet] = useState(initial?.street ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [cascadeKey, setCascadeKey] = useState(0);
  const [formError, setFormError] = useState("");

  const handleSubmit = () => {
    if (
      !selectedCountry[0]?.value ||
      !selectedDivision[0]?.value ||
      !selectedDistrict[0]?.value ||
      !selectedThana[0]?.value
    ) {
      setFormError("Please select all location fields");
      return;
    }
    if (!street.trim()) {
      setFormError("Street address is required");
      return;
    }
    setFormError("");
    onSubmit({
      countryId: selectedCountry[0].value as string,
      countryName: selectedCountry[0].label,
      divisionId: selectedDivision[0].value as string,
      divisionName: selectedDivision[0].label,
      districtId: selectedDistrict[0].value as string,
      districtName: selectedDistrict[0].label,
      thanaId: selectedThana[0].value as string,
      thanaName: selectedThana[0].label,
      street: street.trim(),
      postalCode: postalCode.trim() || undefined,
      isDefault: isDefault || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Address" : "Add New Address"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {/* Country */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Country *</Label>
            <CustomSelect
              key={`modal-country-${cascadeKey}`}
              endpoint={`${API_URL}/country`}
              fields={["id", "name"]}
              mapToOption={(item) => ({ value: String(item.id), label: item.name })}
              value={selectedCountry}
              onChange={(vals) => {
                setSelectedCountry(toArray(vals));
                setSelectedDivision([]);
                setSelectedDistrict([]);
                setSelectedThana([]);
                setCascadeKey((k) => k + 1);
              }}
              searchable
              paginated
              placeholder="Select country"
            />
          </div>

          {/* Division */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Division *</Label>
            <CustomSelect
              key={`modal-division-${cascadeKey}-${selectedCountry[0]?.value ?? ""}`}
              endpoint={`${API_URL}/division`}
              fields={["id", "name"]}
              extraParams={selectedCountry[0]?.value ? { countryId: selectedCountry[0].value } : {}}
              mapToOption={(item) => ({ value: String(item.id), label: item.name })}
              value={selectedDivision}
              onChange={(vals) => {
                setSelectedDivision(toArray(vals));
                setSelectedDistrict([]);
                setSelectedThana([]);
              }}
              searchable
              paginated
              placeholder={selectedCountry[0]?.value ? "Select division" : "Select country first"}
            />
          </div>

          {/* District */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">District *</Label>
            <CustomSelect
              key={`modal-district-${selectedDivision[0]?.value ?? "none"}`}
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
              }}
              searchable
              paginated
              placeholder={selectedDivision[0]?.value ? "Select district" : "Select division first"}
            />
          </div>

          {/* Thana */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Area / Thana *</Label>
            <CustomSelect
              key={`modal-thana-${selectedDistrict[0]?.value ?? "none"}`}
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
              onChange={(vals) => setSelectedThana(toArray(vals))}
              searchable
              paginated
              placeholder={selectedDistrict[0]?.value ? "Select area" : "Select district first"}
            />
          </div>

          {/* Street */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Street / Area *</Label>
            <Input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="House, road, block"
              className="border-border bg-card-primary h-10 text-xs"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Postal Code</Label>
            <Input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal code"
              className="border-border bg-card-primary h-10 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="modal-isDefault"
            checked={isDefault}
            onCheckedChange={(c) => setIsDefault(!!c)}
          />
          <label
            htmlFor="modal-isDefault"
            className="cursor-pointer text-xs font-medium select-none"
          >
            Save as default address
          </label>
        </div>

        {formError && <p className="text-danger text-sm">{formError}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="border-border cursor-pointer rounded-lg border px-4 py-2 text-sm hover:opacity-80"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-button-primary cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Use This Address
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormModal;
