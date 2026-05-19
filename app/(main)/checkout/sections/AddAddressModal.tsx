"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { API_URL } from "@/redux/api/baseApi";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { useGetMeQuery, useAddUserAddressMutation } from "@/redux/features/user/user.api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export interface SavedAddressDetail {
  fullName: string;
  phone: string;
  countryName: string;
  divisionName: string;
  districtName: string;
  thanaName: string;
  streetAddress: string;
  postcode: string;
  isDefault: boolean;
}

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: SavedAddressDetail, thanaId: string) => void;
}

const toArray = (val: SelectOption | SelectOption[] | null): SelectOption[] => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

const AddAddressModal = ({ isOpen, onClose, onSave }: AddAddressModalProps) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: userData } = useGetMeQuery(undefined, { skip: !currentUser });
  const [addUserAddress, { isLoading: isSavingAddress }] = useAddUserAddressMutation();

  // Address Modal form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<SelectOption[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption[]>([]);
  const [selectedThana, setSelectedThana] = useState<SelectOption[]>([]);
  const [streetAddress, setStreetAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Error messages
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

  // Pre-fill phone and name if user info is loaded
  useEffect(() => {
    if (userData?.data) {
      const profile = userData.data;
      const phoneNum = (profile as any)?.user?.phoneNumber || (currentUser as any)?.phoneNumber || "";
      setPhone(phoneNum);

      if ((profile as any)?.user?.name) {
        setFullName((profile as any).user.name || "");
      }
    }
  }, [userData, currentUser]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!phone.trim()) errors.phone = "Phone number is required";
    if (selectedCountry.length === 0) errors.country = "Please select a Country";
    if (selectedDivision.length === 0) errors.division = "Please select a Division";
    if (selectedDistrict.length === 0) errors.district = "Please select a District";
    if (selectedThana.length === 0) errors.thana = "Please select an Area / Thana";
    if (!streetAddress.trim()) errors.streetAddress = "Street address is required";
    if (!postcode.trim()) errors.postcode = "Postcode is required";

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setModalErrors({});

    const thanaIdVal = String(selectedThana[0]?.value ?? "");
    const thanaLabel = String(selectedThana[0]?.label ?? "");
    const districtLabel = String(selectedDistrict[0]?.label ?? "");
    const divisionLabel = String(selectedDivision[0]?.label ?? "");
    const countryLabel = String(selectedCountry[0]?.label ?? "");

    const addressDetail: SavedAddressDetail = {
      fullName,
      phone,
      countryName: countryLabel,
      divisionName: divisionLabel,
      districtName: districtLabel,
      thanaName: thanaLabel,
      streetAddress,
      postcode,
      isDefault,
    };

    try {
      // Save backend-side
      await addUserAddress({
        thanaId: thanaIdVal,
        street: streetAddress,
        postalCode: postcode,
      }).unwrap();
      toast.success("Address successfully saved to your profile!");
    } catch (apiError: any) {
      console.log("API error saving address:", apiError);
    }

    onSave(addressDetail, thanaIdVal);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden shadow-2xl border border-slate-100 rounded-lg">
        <div className="border-b border-slate-100 px-8 py-5">
          <DialogTitle className="text-lg font-semibold text-slate-950">Add new address</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Use this address for delivery and billing.
          </DialogDescription>
        </div>

        <form onSubmit={handleSaveAddress} className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            {/* Full name */}
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
                Full name *
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className={`h-10 text-xs border-slate-200 placeholder:text-slate-400 focus:border-black focus:ring-0 ${modalErrors.fullName ? "border-red-500" : ""
                  }`}
              />
              {modalErrors.fullName && (
                <p className="text-3xs text-red-500 font-medium">{modalErrors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                Phone *
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880"
                className={`h-10 text-xs border-slate-200 placeholder:text-slate-400 focus:border-black focus:ring-0 ${modalErrors.phone ? "border-red-500" : ""
                  }`}
              />
              {modalErrors.phone && (
                <p className="text-3xs text-red-500 font-medium">{modalErrors.phone}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Country *</Label>
              <div className={modalErrors.country ? "rounded border border-red-500" : ""}>
                <CustomSelect
                  endpoint={`${API_URL}/country`}
                  fields={["id", "name"]}
                  mapToOption={(item) => ({
                    value: String(item.id),
                    label: item.name,
                  })}
                  value={selectedCountry}
                  onChange={(vals) => {
                    const safe = toArray(vals);
                    setSelectedCountry(safe);
                    setSelectedDivision([]);
                    setSelectedDistrict([]);
                    setSelectedThana([]);
                  }}
                  searchable
                  paginated
                  placeholder="Select country"
                />
              </div>
              {modalErrors.country && (
                <p className="text-3xs text-red-500 font-medium">{modalErrors.country}</p>
              )}
            </div>

            {/* Division */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Division *</Label>
              <div className={modalErrors.division ? "rounded border border-red-500" : ""}>
                <CustomSelect
                  key={`modal-division-${selectedCountry[0]?.value}`}
                  endpoint={`${API_URL}/division`}
                  fields={["id", "name"]}
                  extraParams={selectedCountry[0]?.value ? { countryId: selectedCountry[0].value } : {}}
                  mapToOption={(item) => ({
                    value: String(item.id),
                    label: item.name,
                  })}
                  value={selectedDivision}
                  onChange={(vals) => {
                    const safe = toArray(vals);
                    setSelectedDivision(safe);
                    setSelectedDistrict([]);
                    setSelectedThana([]);
                  }}
                  searchable
                  paginated
                  placeholder={selectedCountry[0]?.value ? "Select division" : "Select country first"}
                />
              </div>
              {modalErrors.division && (
                <p className="text-3xs text-red-500 font-medium">{modalErrors.division}</p>
              )}
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">District *</Label>
              <div className={modalErrors.district ? "rounded border border-red-500" : ""}>
                <CustomSelect
                  key={`modal-district-${selectedDivision[0]?.value}`}
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
                  mapToOption={(item) => ({
                    value: String(item.id),
                    label: item.name,
                  })}
                  value={selectedDistrict}
                  onChange={(vals) => {
                    const safe = toArray(vals);
                    setSelectedDistrict(safe);
                    setSelectedThana([]);
                  }}
                  searchable
                  paginated
                  placeholder={selectedDivision[0]?.value ? "Select district" : "Select division first"}
                />
              </div>
              {modalErrors.district && (
                <p className="text-3xs text-red-500 font-medium">{modalErrors.district}</p>
              )}
            </div>

            {/* Area (Thana) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Area *</Label>
              <div className={modalErrors.thana ? "rounded border border-red-500" : ""}>
                <CustomSelect
                  key={`modal-thana-${selectedDistrict[0]?.value}`}
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
                  mapToOption={(item) => ({
                    value: String(item.id),
                    label: item.name,
                  })}
                  value={selectedThana}
                  onChange={(vals) => setSelectedThana(toArray(vals))}
                  searchable
                  paginated
                  placeholder={selectedDistrict[0]?.value ? "Select area" : "Select district first"}
                />
              </div>
              {modalErrors.thana && (
                <p className="text-3xs text-red-500 font-medium">{modalErrors.thana}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold text-slate-700">
                Address *
              </Label>
              <Input
                id="address"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="House, road, block"
                className={`h-10 text-xs border-slate-200 placeholder:text-slate-400 focus:border-black focus:ring-0 ${modalErrors.streetAddress ? "border-red-500" : ""
                  }`}
              />
              {modalErrors.streetAddress && (
                <p className="text-3xs text-red-500 font-medium">{modalErrors.streetAddress}</p>
              )}
            </div>

            {/* Postcode */}
            <div className="space-y-1.5">
              <Label htmlFor="postcode" className="text-xs font-semibold text-slate-700">
                Postcode *
              </Label>
              <Input
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Postcode"
                className={`h-10 text-xs border-slate-200 placeholder:text-slate-400 focus:border-black focus:ring-0 ${modalErrors.postcode ? "border-red-500" : ""
                  }`}
              />
              {modalErrors.postcode && (
                <p className="text-3xs text-red-500 font-medium">{modalErrors.postcode}</p>
              )}
            </div>

          </div>

          {/* Set as Default Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="defaultAddress"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(!!checked)}
            />
            <label htmlFor="defaultAddress" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              Set as default address
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-slate-600 hover:text-black hover:underline cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingAddress}
              className="flex items-center justify-center gap-1.5 rounded bg-black px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
            >
              {isSavingAddress ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save address</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAddressModal;
