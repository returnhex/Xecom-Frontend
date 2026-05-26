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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
      const phoneNum =
        (profile as any)?.user?.phoneNumber || (currentUser as any)?.phoneNumber || "";
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
      <DialogContent className="border-border bg-card-primary max-w-2xl overflow-hidden rounded-lg border p-0 shadow-2xl">
        <div className="border-border border-b px-8 py-5">
          <DialogTitle className="text-foreground text-lg font-semibold">
            Add new address
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1 text-xs">
            Use this address for delivery and billing.
          </DialogDescription>
        </div>

        <form onSubmit={handleSaveAddress} className="space-y-5 px-8 py-6">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            {/* Full name */}
            <div className="col-span-1 space-y-1.5 sm:col-span-2">
              <Label htmlFor="fullName" className="text-foreground text-xs font-semibold">
                Full name *
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className={`border-border bg-card-primary text-foreground placeholder:text-muted-foreground focus:border-button-primary h-10 text-xs focus:ring-0 ${
                  modalErrors.fullName ? "border-danger text-danger" : ""
                }`}
              />
              {modalErrors.fullName && (
                <p className="text-3xs text-danger font-medium">{modalErrors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div className="col-span-1 space-y-1.5 sm:col-span-2">
              <Label htmlFor="phone" className="text-foreground text-xs font-semibold">
                Phone *
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880"
                className={`border-border bg-card-primary text-foreground placeholder:text-muted-foreground focus:border-button-primary h-10 text-xs focus:ring-0 ${
                  modalErrors.phone ? "border-danger text-danger" : ""
                }`}
              />
              {modalErrors.phone && (
                <p className="text-3xs text-danger font-medium">{modalErrors.phone}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-semibold">Country *</Label>
              <div className={modalErrors.country ? "border-danger rounded border" : ""}>
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
                <p className="text-3xs text-danger font-medium">{modalErrors.country}</p>
              )}
            </div>

            {/* Division */}
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-semibold">Division *</Label>
              <div className={modalErrors.division ? "border-danger rounded border" : ""}>
                <CustomSelect
                  key={`modal-division-${selectedCountry[0]?.value}`}
                  endpoint={`${API_URL}/division`}
                  fields={["id", "name"]}
                  extraParams={
                    selectedCountry[0]?.value ? { countryId: selectedCountry[0].value } : {}
                  }
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
                  placeholder={
                    selectedCountry[0]?.value ? "Select division" : "Select country first"
                  }
                />
              </div>
              {modalErrors.division && (
                <p className="text-3xs text-danger font-medium">{modalErrors.division}</p>
              )}
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-semibold">District *</Label>
              <div className={modalErrors.district ? "border-danger rounded border" : ""}>
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
                  placeholder={
                    selectedDivision[0]?.value ? "Select district" : "Select division first"
                  }
                />
              </div>
              {modalErrors.district && (
                <p className="text-3xs text-danger font-medium">{modalErrors.district}</p>
              )}
            </div>

            {/* Area (Thana) */}
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-semibold">Area *</Label>
              <div className={modalErrors.thana ? "border-danger rounded border" : ""}>
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
                <p className="text-3xs text-danger font-medium">{modalErrors.thana}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-foreground text-xs font-semibold">
                Address *
              </Label>
              <Input
                id="address"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="House, road, block"
                className={`border-border bg-card-primary text-foreground placeholder:text-muted-foreground focus:border-button-primary h-10 text-xs focus:ring-0 ${
                  modalErrors.streetAddress ? "border-danger text-danger" : ""
                }`}
              />
              {modalErrors.streetAddress && (
                <p className="text-3xs text-danger font-medium">{modalErrors.streetAddress}</p>
              )}
            </div>

            {/* Postcode */}
            <div className="space-y-1.5">
              <Label htmlFor="postcode" className="text-foreground text-xs font-semibold">
                Postcode *
              </Label>
              <Input
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Postcode"
                className={`border-border bg-card-primary text-foreground placeholder:text-muted-foreground focus:border-button-primary h-10 text-xs focus:ring-0 ${
                  modalErrors.postcode ? "border-danger text-danger" : ""
                }`}
              />
              {modalErrors.postcode && (
                <p className="text-3xs text-danger font-medium">{modalErrors.postcode}</p>
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
            <label
              htmlFor="defaultAddress"
              className="text-foreground cursor-pointer text-xs font-medium select-none"
            >
              Set as default address
            </label>
          </div>

          {/* Action Buttons */}
          <div className="border-border flex items-center justify-end gap-4 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingAddress}
              className="bg-button-primary text-button-primary-foreground flex items-center justify-center gap-1.5 rounded-lg px-6 py-2.5 text-xs font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
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
