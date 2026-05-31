"use client";

import React, { useEffect, useMemo, useState } from "react";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { API_URL } from "@/redux/api/baseApi";
import {
  useAddOrUpdateUserAddressMutation,
  useGetUserAddressesQuery,
} from "@/redux/features/user/user.api";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Loader2, Save, Globe, Map, Navigation, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SingleAddressBox, { AddressFormState } from "./SingleAddressBox";

type AddressDraft = Omit<AddressFormState, "key">;

const createKey = () => {
  // Prefer UUID when available (supported in modern browsers)
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const idOption = (value: string) => ({ value, label: value });

const emptyDraft = (): AddressDraft => ({
  country: null,
  division: null,
  district: null,
  thana: null,
  street: "",
  postalCode: "",
  isDefault: false,
});

const AddressSection = () => {
  const {
    data: addressData,
    isLoading: isAddressLoading,
    isFetching,
    refetch,
  } = useGetUserAddressesQuery(undefined);
  const [addOrUpdateUserAddress] = useAddOrUpdateUserAddressMutation();

  const [items, setItems] = useState<AddressFormState[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newDraft, setNewDraft] = useState<AddressDraft>(emptyDraft());
  const [newSaving, setNewSaving] = useState(false);

  const serverItems = useMemo((): AddressFormState[] => {
    const addresses = addressData?.data ?? [];
    return addresses.map((addr) => ({
      key: createKey(),
      country: addr.countryId ? idOption(String(addr.countryId)) : null,
      division: addr.divisionId ? idOption(String(addr.divisionId)) : null,
      district: addr.districtId ? idOption(String(addr.districtId)) : null,
      thana: addr.thanaId ? idOption(String(addr.thanaId)) : null,
      street: addr.street ?? "",
      postalCode:
        addr.postalCode !== undefined && addr.postalCode !== null ? String(addr.postalCode) : "",
      isDefault: !!addr.isDefault,
    }));
  }, [addressData]);

  useEffect(() => {
    setItems(serverItems);
  }, [serverItems]);

  const updateItem = (key: string, patch: Partial<AddressFormState>) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };

  const validateAndBuildDto = (draft: AddressDraft) => {
    const thanaId = String(draft.thana?.value ?? "");
    if (!draft.country?.value) return { ok: false as const, message: "Please select a country." };
    if (!draft.division?.value) return { ok: false as const, message: "Please select a division." };
    if (!draft.district?.value) return { ok: false as const, message: "Please select a district." };
    if (!thanaId) return { ok: false as const, message: "Please select a thana." };
    if (!draft.street.trim()) return { ok: false as const, message: "Street is required." };

    const postalRaw = draft.postalCode.trim();
    const postalCode = postalRaw ? Number(postalRaw) : undefined;
    if (postalRaw && Number.isNaN(postalCode)) {
      return { ok: false as const, message: "Postal code must be a number." };
    }

    return {
      ok: true as const,
      dto: {
        thanaId,
        street: draft.street.trim(),
        postalCode,
        isDefault: draft.isDefault,
      },
    };
  };

  const handleSaveExisting = async (item: AddressFormState) => {
    const built = validateAndBuildDto(item);
    if (!built.ok) return toast.error(built.message);

    setSavingKey(item.key);
    try {
      const result = await addOrUpdateUserAddress(built.dto).unwrap();
      toast.success(result?.message || "Address saved successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save address.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveNew = async () => {
    const built = validateAndBuildDto(newDraft);
    if (!built.ok) return toast.error(built.message);

    setNewSaving(true);
    try {
      const result = await addOrUpdateUserAddress(built.dto).unwrap();
      toast.success(result?.message || "Address saved successfully!");
      setNewOpen(false);
      setNewDraft(emptyDraft());
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save address.");
    } finally {
      setNewSaving(false);
    }
  };

  return (
    <div className="bg-card-primary border-border rounded-lg border shadow-sm">
      <div className="border-border flex items-start justify-between gap-4 border-b bg-linear-to-r from-transparent to-black/20 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <MapPin className="text-primary h-5 w-5" />
            Address Information
          </h2>
          <p className="text-muted-foreground text-sm">Manage your saved shipping addresses.</p>
        </div>

        <Dialog
          open={newOpen}
          onOpenChange={(v) => {
            setNewOpen(v);
            if (!v) setNewDraft(emptyDraft());
          }}
        >
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 bg-button-primary text-button-primary-foreground h-10 cursor-pointer rounded-xl px-4 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> Add new address
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add new address</DialogTitle>
              <DialogDescription>Fill the details and save.</DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveNew();
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-2">
                    <Globe size={14} /> Country
                  </Label>
                  <CustomSelect
                    endpoint={`${API_URL}/country`}
                    fields={["id", "name"]}
                    mapToOption={(x) => ({ value: String(x.id), label: x.name })}
                    value={newDraft.country}
                    onChange={(value) => {
                      const option = value as SelectOption | null;
                      const prevId = String(newDraft.country?.value ?? "");
                      const nextId = String(option?.value ?? "");

                      if (prevId !== nextId) {
                        setNewDraft((p) => ({
                          ...p,
                          country: option,
                          division: null,
                          district: null,
                          thana: null,
                        }));
                      } else {
                        setNewDraft((p) => ({ ...p, country: option }));
                      }
                    }}
                    searchable
                    paginated
                    loadingStyle="eager"
                    placeholder="Select Country"
                    disabled={newSaving}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-2">
                    <Map size={14} /> Division
                  </Label>
                  <CustomSelect
                    endpoint={`${API_URL}/division`}
                    fields={["id", "name"]}
                    extraParams={
                      newDraft.country?.value ? { countryId: String(newDraft.country.value) } : {}
                    }
                    mapToOption={(x) => ({ value: String(x.id), label: x.name })}
                    value={newDraft.division}
                    onChange={(value) => {
                      const option = value as SelectOption | null;
                      const prevId = String(newDraft.division?.value ?? "");
                      const nextId = String(option?.value ?? "");

                      if (prevId !== nextId) {
                        setNewDraft((p) => ({
                          ...p,
                          division: option,
                          district: null,
                          thana: null,
                        }));
                      } else {
                        setNewDraft((p) => ({ ...p, division: option }));
                      }
                    }}
                    searchable
                    paginated
                    loadingStyle="eager"
                    placeholder={
                      newDraft.country?.value ? "Select Division" : "Select Country first"
                    }
                    disabled={newSaving || !newDraft.country?.value}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-2">
                    <Navigation size={14} /> District
                  </Label>
                  <CustomSelect
                    endpoint={`${API_URL}/district`}
                    fields={["id", "name"]}
                    extraParams={
                      newDraft.division?.value
                        ? {
                            countryId: String(newDraft.country?.value ?? ""),
                            divisionId: String(newDraft.division.value),
                          }
                        : {}
                    }
                    mapToOption={(x) => ({ value: String(x.id), label: x.name })}
                    value={newDraft.district}
                    onChange={(value) => {
                      const option = value as SelectOption | null;
                      const prevId = String(newDraft.district?.value ?? "");
                      const nextId = String(option?.value ?? "");

                      if (prevId !== nextId) {
                        setNewDraft((p) => ({ ...p, district: option, thana: null }));
                      } else {
                        setNewDraft((p) => ({ ...p, district: option }));
                      }
                    }}
                    searchable
                    paginated
                    loadingStyle="eager"
                    placeholder={
                      newDraft.division?.value ? "Select District" : "Select Division first"
                    }
                    disabled={newSaving || !newDraft.division?.value}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-2">
                    <MapPin size={14} /> Thana
                  </Label>
                  <CustomSelect
                    endpoint={`${API_URL}/thana`}
                    fields={["id", "name"]}
                    extraParams={
                      newDraft.district?.value
                        ? {
                            countryId: String(newDraft.country?.value ?? ""),
                            divisionId: String(newDraft.division?.value ?? ""),
                            districtId: String(newDraft.district.value),
                          }
                        : {}
                    }
                    mapToOption={(x) => ({ value: String(x.id), label: x.name })}
                    value={newDraft.thana}
                    onChange={(value) =>
                      setNewDraft((p) => ({ ...p, thana: value as SelectOption | null }))
                    }
                    searchable
                    paginated
                    loadingStyle="eager"
                    placeholder={
                      newDraft.district?.value ? "Select Thana" : "Select District first"
                    }
                    disabled={newSaving || !newDraft.district?.value}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label>Street</Label>
                  <Input
                    value={newDraft.street}
                    onChange={(e) => setNewDraft((p) => ({ ...p, street: e.target.value }))}
                    placeholder="House, road, block"
                    className="h-11 rounded-xl"
                    disabled={newSaving}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={newDraft.postalCode}
                    onChange={(e) => setNewDraft((p) => ({ ...p, postalCode: e.target.value }))}
                    inputMode="numeric"
                    placeholder="e.g. 1207"
                    className="h-11 rounded-xl"
                    disabled={newSaving}
                  />
                </div>

                <div className="flex items-center gap-2 pt-7">
                  <Checkbox
                    id="new-default"
                    checked={newDraft.isDefault}
                    onCheckedChange={(checked) =>
                      setNewDraft((p) => ({ ...p, isDefault: !!checked }))
                    }
                    disabled={newSaving}
                  />
                  <label htmlFor="new-default" className="text-sm font-medium select-none">
                    Default address
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={newSaving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-button-primary text-button-primary-foreground flex min-w-40 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all disabled:opacity-70"
                >
                  {newSaving ? (
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
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-8">
        {isAddressLoading && items.length === 0 ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading addresses...
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No saved addresses yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {items.map((item, idx) => {
              const saving = savingKey === item.key;
              const disabledAll = saving;

              return (
                <SingleAddressBox
                  key={item.key}
                  item={item}
                  index={idx}
                  isFetching={isFetching}
                  saving={saving}
                  disabledAll={disabledAll}
                  onSave={handleSaveExisting}
                  updateItem={updateItem}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSection;
