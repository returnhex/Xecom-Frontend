"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Phone, User } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import AddAddressModal, { SavedAddressDetail } from "./AddAddressModal";

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

const ShippingInfo = ({ street, postalCode, onLocationChange, setTouched }: ShippingInfoProps) => {
  // Check auth state
  const currentUser = useAppSelector(selectCurrentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [savedAddress, setSavedAddress] = useState<SavedAddressDetail | null>(null);
  useEffect(() => {
    const storageKey = currentUser?.id ? `saved_address_${currentUser.id}` : "saved_address_guest";
    const storageThanaKey = currentUser?.id
      ? `saved_address_thana_id_${currentUser.id}`
      : "saved_address_thana_id_guest";

    const cached = localStorage.getItem(storageKey);
    const cachedThanaId = localStorage.getItem(storageThanaKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as SavedAddressDetail;
        setSavedAddress(parsed);

        // Sync parent form fields
        onLocationChange({
          thanaId: cachedThanaId || "",
          street: parsed.streetAddress,
          postalCode: parsed.postcode,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);

  // Called when modal saves the address successfully
  const handleSaveModalAddress = (addressDetail: SavedAddressDetail, thanaIdVal: string) => {
    setSavedAddress(addressDetail);

    // Save locally
    const storageKey = currentUser?.id ? `saved_address_${currentUser.id}` : "saved_address_guest";
    const storageThanaKey = currentUser?.id
      ? `saved_address_thana_id_${currentUser.id}`
      : "saved_address_thana_id_guest";

    localStorage.setItem(storageKey, JSON.stringify(addressDetail));
    localStorage.setItem(storageThanaKey, thanaIdVal);

    // Call checkout parent hook
    onLocationChange({
      thanaId: thanaIdVal,
      street: addressDetail.streetAddress,
      postalCode: addressDetail.postcode,
    });

    setTouched((prev: any) => ({ ...prev, thanaId: true, street: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Shipping & Billing
          </h2>
          <p className="text-sm text-muted-foreground">Select a saved address or add a new one.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex cursor-pointer items-center justify-center gap-1.5 self-start rounded-lg bg-button-primary px-4 py-2 text-xs font-semibold text-button-primary-foreground transition-all hover:opacity-90 active:scale-95 sm:self-auto"
        >
          <Plus size={14} />
          <span>Add address</span>
        </button>
      </div>

      {/* Address Content Area */}
      {!savedAddress ? (
        /* Dotted No Saved Address Card */
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-12 text-center">
          <h3 className="mb-1 text-base font-semibold text-foreground">No saved addresses yet</h3>
          <p className="mb-5 text-sm text-muted-foreground">Add an address to speed up your checkout.</p>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-button-primary px-4 py-2 text-xs font-semibold text-button-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            <Plus size={14} />
            <span>Add address</span>
          </button>
        </div>
      ) : (
        /* Premium Saved Address Card showing details */
        <div className="relative rounded-lg border-2 border-border bg-card-primary p-6 shadow-sm transition hover:shadow-md">
          <span className="absolute top-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Edit2 size={13} />
              <span>Edit</span>
            </button>
          </span>

          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground">
              <User size={14} />
            </div>
            <h4 className="font-semibold text-foreground">{savedAddress.fullName}</h4>
            {savedAddress.isDefault && (
              <span className="text-2xs inline-flex items-center rounded-full bg-batch/30 px-2 py-0.5 font-medium text-batch-foreground">
                Default Address
              </span>
            )}
          </div>

          <div className="space-y-2.5 pl-9 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 text-muted-foreground/80" />
              <span className="text-foreground/90">{savedAddress.phone}</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-muted-foreground/80" />
              <span className="leading-relaxed text-foreground/90">
                {savedAddress.streetAddress}, {savedAddress.thanaName}, {savedAddress.districtName},{" "}
                {savedAddress.divisionName}, {savedAddress.countryName} - {savedAddress.postcode}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      <AddAddressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSaveModalAddress}
      />
    </div>
  );
};

export default ShippingInfo;

