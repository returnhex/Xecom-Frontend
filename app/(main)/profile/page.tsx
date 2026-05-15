"use client";

import { useState, useRef, useEffect } from "react";
import { useGetMeQuery, useUpdateMeMutation } from "@/redux/features/user/user.api";
import { TAdmin, TCustomer, TStaff } from "@/types";
import ProfileInfoSection from "./sections/ProfileInfoSection";
import AddressSection from "./sections/AddressSection";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProfileFormData {
  name: string;
  phoneNumber: string;
  email: string;

  country: string;
  division: string;
  district: string;
  thana: string;
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [personalLoading, setPersonalLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const [updateMe] = useUpdateMeMutation();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    phoneNumber: "",
    email: "",

    country: "",
    division: "",
    district: "",
    thana: "",
  });

  const { data: userData, isLoading: fetchLoading, error: fetchError } = useGetMeQuery(undefined);

  useEffect(() => {
    if (!userData?.data) return;

    const user = userData.data as TAdmin | TCustomer | TStaff;
    const userData_ = user.user;

    if (!userData_) return;

    setFormData({
      name: userData_.name || "",
      phoneNumber: userData_.phoneNumber || "",
      email: userData_.email || "",
      country: userData_.country || "",
      division: userData_.division || "",
      district: userData_.district || "",
      thana: userData_.thana || "",
    });

    if (userData_.profilePicture) {
      setPreviewImage(userData_.profilePicture);
    }
  }, [userData]);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "country") {
        updated.division = "";
        updated.district = "";
        updated.thana = "";
      }
      if (name === "division") {
        updated.district = "";
        updated.thana = "";
      }
      if (name === "district") {
        updated.thana = "";
      }
      return updated;
    });
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalLoading(true);

    try {
      if (!formData.name.trim()) {
        toast.error("Full name is required");
        setPersonalLoading(false);
        return;
      }

      const body = new FormData();
      body.append("name", formData.name);
      body.append("phoneNumber", formData.phoneNumber);
      if (selectedFile) {
        body.append("profilePicture", selectedFile);
      }

      const result = await updateMe(body).unwrap();
      toast.success(result.message || "Personal info updated successfully!");
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update personal info.");
    } finally {
      setPersonalLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);

    try {
      const body = new FormData();
      body.append("country", formData.country);
      body.append("division", formData.division);
      body.append("district", formData.district);
      body.append("thana", formData.thana);

      const result = await updateMe(body).unwrap();
      toast.success(result.message || "Address updated successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update address.");
    } finally {
      setAddressLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen container">
      <div className="flex flex-col items-start justify-center gap-8 lg:flex-row">
        {/* Personal Information Card */}
        <div className="w-full lg:flex-1">
          <ProfileInfoSection
            formData={formData}
            handleChange={handleChange}
            previewImage={previewImage}
            handleImageClick={handleImageClick}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            loading={personalLoading}
            onSubmit={handlePersonalInfoSubmit}
          />
        </div>

        {/* Address Information Card */}
        <div className="w-full lg:flex-1">
          <AddressSection
            formData={formData}
            handleChange={handleChange as any}
            loading={addressLoading}
            onSubmit={handleAddressSubmit}
          />
        </div>
      </div>
    </div>
  );
}
