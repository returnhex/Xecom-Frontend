"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Plus, Pencil, CheckCircle2 } from "lucide-react";
import { useGetUserAddressesQuery } from "@/redux/features/user/user.api";
import { TUserAddress } from "@/redux/features/user/dto/user.dto";
import AddressFormModal, { TNewAddressData } from "./AddressFormModal";

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

const AddressInfo = ({ onLocationChange }: AddressInfoProps) => {
  const { data: addressesData, isLoading } = useGetUserAddressesQuery(undefined);
  const addresses: TUserAddress[] = addressesData?.data ?? [];

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newAddressData, setNewAddressData] = useState<TNewAddressData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<TNewAddressData | null>(null);
  const initialized = useRef(false);

  // Auto-select the default address on first load
  useEffect(() => {
    if (initialized.current || !addresses.length) return;
    initialized.current = true;
    const def = addresses.find((a) => a.isDefault);
    if (def) {
      setSelectedAddressId(def.id);
      onLocationChange({ addressId: def.id });
    }
  }, [addresses]);

  const selectSavedAddress = (addr: TUserAddress) => {
    setSelectedAddressId(addr.id);
    setNewAddressData(null);
    onLocationChange({ addressId: addr.id });
  };

  const handleModalSubmit = (data: TNewAddressData) => {
    setNewAddressData(data);
    setSelectedAddressId(null);
    setModalOpen(false);
    onLocationChange({
      thanaId: data.thanaId,
      street: data.street,
      postalCode: data.postalCode,
      isDefault: data.isDefault,
    });
  };

  const openAddNew = () => {
    setModalInitial(null);
    setModalOpen(true);
  };

  const openEdit = () => {
    setModalInitial(newAddressData);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-button-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;
  const hasSelected = !!newAddressData || !!selectedAddress;

  // Addresses not currently shown in the selected card
  const otherAddresses = newAddressData
    ? addresses
    : addresses.filter((a) => a.id !== selectedAddressId);

  return (
    <div className="space-y-5">
      {/* ── No saved addresses and no new address entered ── */}
      {addresses.length === 0 && !newAddressData ? (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">No saved address found.</p>
          <button
            type="button"
            onClick={openAddNew}
            className="border-button-primary text-button-primary hover:bg-button-primary/5 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all"
          >
            <Plus size={15} />
            Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ── Selected address — full width ── */}
          {newAddressData ? (
            <div className="border-button-primary bg-button-primary/5 w-full rounded-xl border-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-button-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-foreground text-sm font-semibold">
                      {newAddressData.thanaName}, {newAddressData.districtName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {newAddressData.divisionName}, {newAddressData.countryName}
                    </p>
                    <p className="text-muted-foreground text-xs">{newAddressData.street}</p>
                    {newAddressData.postalCode && (
                      <p className="text-muted-foreground text-xs">
                        Postal: {newAddressData.postalCode}
                      </p>
                    )}
                    <span className="text-button-primary text-xs font-medium">New address</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={openEdit}
                    title="Edit"
                    className="text-muted-foreground hover:text-button-primary transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <CheckCircle2 size={20} className="text-button-primary" />
                </div>
              </div>
            </div>
          ) : selectedAddress ? (
            <div className="border-button-primary bg-button-primary/5 w-full rounded-xl border-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-button-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-foreground text-sm font-semibold">
                      {selectedAddress.thanaName}, {selectedAddress.districtName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {selectedAddress.divisionName}, {selectedAddress.countryName}
                    </p>
                    <p className="text-muted-foreground text-xs">{selectedAddress.street}</p>
                    {selectedAddress.postalCode != null && (
                      <p className="text-muted-foreground text-xs">
                        Postal: {selectedAddress.postalCode}
                      </p>
                    )}
                    {selectedAddress.isDefault && (
                      <span className="text-button-secondary text-xs font-medium">Default</span>
                    )}
                  </div>
                </div>
                <CheckCircle2 size={20} className="text-button-primary shrink-0" />
              </div>
            </div>
          ) : null}

          {/* ── "Change address to —" + other address cards ── */}
          {otherAddresses.length > 0 && (
            <div className="space-y-3">
              {hasSelected && (
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Change address to —
                </p>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {otherAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectSavedAddress(addr)}
                    className="border-border bg-card-primary hover:border-button-primary/60 flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-left transition-all hover:shadow-sm"
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
                      {addr.postalCode != null && (
                        <p className="text-muted-foreground text-xs">Postal: {addr.postalCode}</p>
                      )}
                      {addr.isDefault && (
                        <span className="text-button-secondary text-xs font-medium">Default</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Add another address ── */}
          <button
            type="button"
            onClick={openAddNew}
            className="border-border text-muted-foreground hover:border-button-primary hover:text-button-primary flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all"
          >
            <Plus size={15} />
            {addresses.length === 0 ? "Add address" : "Add another address"}
          </button>
        </div>
      )}

      <AddressFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initial={modalInitial}
      />
    </div>
  );
};

export default AddressInfo;
