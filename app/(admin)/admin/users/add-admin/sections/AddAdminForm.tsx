"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Gender } from "@/constants/enum";

import { ImageUpload } from "@/components/custom/ImageUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2, Eye, EyeOff } from "lucide-react";

import { useRegisterAdminMutation } from "@/redux/features/user/admin.api";
import { TRegisterAdminDto } from "@/redux/features/user/dto/admin.dto";

import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { API_URL } from "@/redux/api/baseApi";

export default function AddAdminForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption | null>(null);
  const [selectedThana, setSelectedThana] = useState<SelectOption | null>(null);
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [registerAdmin, { isLoading }] = useRegisterAdminMutation();

  const { register, handleSubmit, setValue, watch, reset } = useForm<TRegisterAdminDto>();

  const genderValue = watch("gender");

  const handleImageChange = (file: File | null) => {
    if (file) {
      setValue("profilePicture", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setValue("profilePicture", undefined);
      setImagePreview(null);
    }
  };

  const resetAddressFields = () => {
    setSelectedCountry(null);
    setSelectedDivision(null);
    setSelectedDistrict(null);
    setSelectedThana(null);
    setStreet("");
    setPostalCode("");
  };

  const onSubmit = async (data: TRegisterAdminDto) => {
    try {
      const formData = new FormData();

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        hireDate: data.hireDate ? new Date(data.hireDate).toISOString() : undefined,
        notes: data.notes,
        thanaId: selectedThana?.value || undefined,
        street: street || undefined,
        postalCode: postalCode || undefined,
      };

      formData.append("text", JSON.stringify(payload));
      if (data.profilePicture) {
        formData.append("file", data.profilePicture);
      }
      const res = await registerAdmin(formData as unknown as TRegisterAdminDto).unwrap();

      toast.success(res?.message || "Admin registered successfully");
      reset();
      setImagePreview(null);
      resetAddressFields();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to register Admin");
    }
  };

  const countryId = selectedCountry?.value ?? null;
  const divisionId = selectedDivision?.value ?? null;
  const districtId = selectedDistrict?.value ?? null;

  return (
    <div className="w-full p-6">
      <div className="w-full rounded-2xl border bg-white p-8 shadow">
        <h2 className="mb-8 text-2xl font-semibold">Register Admin</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-center">
            <ImageUpload value={imagePreview} onChange={handleImageChange} size="lg" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Name *</Label>
              <Input {...register("name")} placeholder="Admin name" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input {...register("email")} placeholder="Admin email" />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input {...register("phoneNumber")} placeholder="Phone number" />
            </div>
            <div>
              <Label>Hire Date *</Label>
              <Input type="date" {...register("hireDate")} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="relative">
              <Label>Password *</Label>
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-7 right-2 text-gray-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div>
              <Label>Gender</Label>
              <Select
                value={genderValue}
                onValueChange={(value) => setValue("gender", value as Gender)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.MALE}>{Gender.MALE}</SelectItem>
                  <SelectItem value={Gender.FEMALE}>{Gender.FEMALE}</SelectItem>
                  <SelectItem value={Gender.OTHER}>{Gender.OTHER}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                {...register("notes")}
                placeholder="Additional notes..."
                className="h-9.5 resize-none"
              />
            </div>
          </div>

          {/* Address */}
          <div className="bg-muted/30 space-y-4 rounded-xl border p-5">
            <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              Address Information
            </p>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Country</Label>
                <CustomSelect
                  endpoint={`${API_URL}/country`}
                  fields={["id", "name"]}
                  mapToOption={(item) => ({ value: String(item.id), label: item.name })}
                  value={selectedCountry ? [selectedCountry] : []}
                  onChange={(vals) => {
                    const v = Array.isArray(vals) ? (vals[0] ?? null) : vals;
                    setSelectedCountry(v);
                    setSelectedDivision(null);
                    setSelectedDistrict(null);
                    setSelectedThana(null);
                  }}
                  searchable
                  paginated
                  placeholder="Select Country"
                />
              </div>

              <div>
                <Label>Division</Label>
                <CustomSelect
                  endpoint={
                    countryId ? `${API_URL}/division?countryId=${countryId}` : `${API_URL}/division`
                  }
                  fields={["id", "name"]}
                  mapToOption={(item) => ({ value: String(item.id), label: item.name })}
                  value={selectedDivision ? [selectedDivision] : []}
                  onChange={(vals) => {
                    const v = Array.isArray(vals) ? (vals[0] ?? null) : vals;
                    setSelectedDivision(v);
                    setSelectedDistrict(null);
                    setSelectedThana(null);
                  }}
                  searchable
                  paginated
                  placeholder="Select Division"
                />
              </div>

              <div>
                <Label>District</Label>
                <CustomSelect
                  endpoint={
                    divisionId
                      ? `${API_URL}/district?divisionId=${divisionId}`
                      : `${API_URL}/district`
                  }
                  fields={["id", "name"]}
                  mapToOption={(item) => ({ value: String(item.id), label: item.name })}
                  value={selectedDistrict ? [selectedDistrict] : []}
                  onChange={(vals) => {
                    const v = Array.isArray(vals) ? (vals[0] ?? null) : vals;
                    setSelectedDistrict(v);
                    setSelectedThana(null);
                  }}
                  searchable
                  paginated
                  placeholder="Select District"
                />
              </div>

              <div>
                <Label>Thana</Label>
                <CustomSelect
                  endpoint={
                    districtId ? `${API_URL}/thana?districtId=${districtId}` : `${API_URL}/thana`
                  }
                  fields={["id", "name"]}
                  mapToOption={(item) => ({ value: String(item.id), label: item.name })}
                  value={selectedThana ? [selectedThana] : []}
                  onChange={(vals) => {
                    const v = Array.isArray(vals) ? (vals[0] ?? null) : vals;
                    setSelectedThana(v);
                  }}
                  searchable
                  paginated
                  placeholder="Select Thana"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <Label>Street</Label>
                <Input
                  placeholder="Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Admin"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
