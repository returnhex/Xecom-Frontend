"use client";

import { motion } from "framer-motion";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { API_URL } from "@/redux/api/baseApi";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CircleDot, Globe, Loader2, Map, MapPin, MapPinX, Navigation, Save } from "lucide-react";

export type AddressFormState = {
  key: string;
  country: SelectOption | null;
  division: SelectOption | null;
  district: SelectOption | null;
  thana: SelectOption | null;
  street: string;
  postalCode: string;
  isDefault: boolean;
};

type SingleAddressBoxProps = {
  item: AddressFormState;
  index: number;
  isFetching: boolean;
  saving: boolean;
  disabledAll: boolean;
  onSave: (item: AddressFormState) => void;
  updateItem: (key: string, patch: Partial<AddressFormState>) => void;
};

const SingleAddressBox = ({
  item,
  index,
  isFetching,
  saving,
  disabledAll,
  onSave,
  updateItem,
}: SingleAddressBoxProps) => {
  const countryId = String(item.country?.value ?? "");
  const divisionId = String(item.division?.value ?? "");
  const districtId = String(item.district?.value ?? "");

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(item);
      }}
      className="border-border bg-background/20 rounded-lg border p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">Address {index + 1}</p>
        </div>
        {isFetching ? <p className="text-muted-foreground text-xs">Refreshing…</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Country */}
        <div className="flex flex-col gap-2">
          <Label className="flex items-center gap-2">
            <Globe size={14} /> Country
          </Label>
          <CustomSelect
            endpoint={`${API_URL}/country`}
            fields={["id", "name"]}
            mapToOption={(x) => ({ value: String(x.id), label: x.name })}
            value={item.country}
            onChange={(value) => {
              const option = value as SelectOption | null;
              const prevId = String(item.country?.value ?? "");
              const nextId = String(option?.value ?? "");

              if (prevId !== nextId) {
                updateItem(item.key, {
                  country: option,
                  division: null,
                  district: null,
                  thana: null,
                });
              } else {
                updateItem(item.key, { country: option });
              }
            }}
            searchable
            paginated
            loadingStyle="eager"
            placeholder="Select Country"
            disabled={disabledAll}
          />
        </div>

        {/* Division */}
        <div className="flex flex-col gap-2">
          <Label className="flex items-center gap-2">
            <Map size={14} /> Division
          </Label>
          <CustomSelect
            key={`division-${item.key}-${countryId}`}
            endpoint={`${API_URL}/division`}
            fields={["id", "name"]}
            extraParams={countryId ? { countryId } : {}}
            mapToOption={(x) => ({ value: String(x.id), label: x.name })}
            value={item.division}
            onChange={(value) => {
              const option = value as SelectOption | null;
              const prevId = String(item.division?.value ?? "");
              const nextId = String(option?.value ?? "");

              if (prevId !== nextId) {
                updateItem(item.key, {
                  division: option,
                  district: null,
                  thana: null,
                });
              } else {
                updateItem(item.key, { division: option });
              }
            }}
            searchable
            paginated
            loadingStyle="eager"
            placeholder={countryId ? "Select Division" : "Select Country first"}
            disabled={disabledAll || !countryId}
          />
        </div>

        {/* District */}
        <div className="flex flex-col gap-2">
          <Label className="flex items-center gap-2">
            <Navigation size={14} /> District
          </Label>
          <CustomSelect
            key={`district-${item.key}-${divisionId}`}
            endpoint={`${API_URL}/district`}
            fields={["id", "name"]}
            extraParams={
              divisionId
                ? {
                    countryId,
                    divisionId,
                  }
                : {}
            }
            mapToOption={(x) => ({ value: String(x.id), label: x.name })}
            value={item.district}
            onChange={(value) => {
              const option = value as SelectOption | null;
              const prevId = String(item.district?.value ?? "");
              const nextId = String(option?.value ?? "");

              if (prevId !== nextId) {
                updateItem(item.key, {
                  district: option,
                  thana: null,
                });
              } else {
                updateItem(item.key, { district: option });
              }
            }}
            searchable
            paginated
            loadingStyle="eager"
            placeholder={divisionId ? "Select District" : "Select Division first"}
            disabled={disabledAll || !divisionId}
          />
        </div>

        {/* Thana */}
        <div className="flex flex-col gap-2">
          <Label className="flex items-center gap-2">
            <MapPin size={14} /> Thana
          </Label>
          <CustomSelect
            key={`thana-${item.key}-${districtId}`}
            endpoint={`${API_URL}/thana`}
            fields={["id", "name"]}
            extraParams={
              districtId
                ? {
                    countryId,
                    divisionId,
                    districtId,
                  }
                : {}
            }
            mapToOption={(x) => ({ value: String(x.id), label: x.name })}
            value={item.thana}
            onChange={(value) => updateItem(item.key, { thana: value as SelectOption | null })}
            searchable
            paginated
            loadingStyle="eager"
            placeholder={districtId ? "Select Thana" : "Select District first"}
            disabled={disabledAll || !districtId}
          />
        </div>

        {/* Street */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label className="flex items-center gap-2">
            <MapPinX size={14} /> Street
          </Label>
          <Input
            value={item.street}
            onChange={(e) => updateItem(item.key, { street: e.target.value })}
            placeholder="House, road, block"
            className="h-11 rounded-xl"
            disabled={disabledAll}
          />
        </div>

        {/* Postal code */}
        <div className="flex flex-col gap-2">
          <Label className="flex items-center gap-2">
            <CircleDot size={14} /> Postal Code
          </Label>{" "}
          <Input
            value={item.postalCode}
            onChange={(e) => updateItem(item.key, { postalCode: e.target.value })}
            inputMode="numeric"
            placeholder="e.g. 1207"
            className="h-11 rounded-xl"
            disabled={disabledAll}
          />
        </div>

        {/* Default */}
        <div className="flex items-center gap-2 pt-7">
          <Checkbox
            id={`default-${item.key}`}
            checked={item.isDefault}
            onCheckedChange={(checked) => updateItem(item.key, { isDefault: !!checked })}
            disabled={disabledAll}
          />
          <label htmlFor={`default-${item.key}`} className="text-sm font-medium select-none">
            Default address
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <motion.button
          type="submit"
          disabled={disabledAll}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-button-primary text-button-primary-foreground flex min-w-40 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all disabled:opacity-70"
        >
          {saving ? (
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
    </motion.form>
  );
};

export default SingleAddressBox;
