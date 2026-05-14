"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useGetMeQuery, useUpdateMeMutation } from "@/redux/features/user/user.api";
import { TAdmin, TCustomer, TStaff } from "@/types";
import ProfileInfoSection from "./sections/ProfileInfoSection";
import AddressSection from "./sections/AddressSection";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
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
    if (!userData?.data) {
      if (fetchError) {
        console.log("Failed to fetch user data:", fetchError);
      }
      return;
    }

    const user = userData.data as TAdmin | TCustomer | TStaff;
    const userData_ = user.user;

    if (!userData_) {
      console.warn("User data not available in response");
      return;
    }

    const name = userData_.name || "";
    const phoneNumber = userData_.phoneNumber || "";
    const email = userData_.email || "";
    const profilePicture = userData_.profilePicture || null;

    console.log("Loaded user data:", {
      name,
      phoneNumber,
      email,
      profilePicture,
    });

    const country = userData_.country || "";
    const division = userData_.division || "";
    const district = userData_.district || "";
    const thana = userData_.thana || "";

    setFormData({
      name,
      phoneNumber,
      email,

      country,
      division,
      district,
      thana,
    });

    if (profilePicture) {
      setPreviewImage(profilePicture);
    }
  }, [userData, fetchError]);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image must be under 5MB.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
    setErrorMsg("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // reset child dropdowns
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

    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (!formData.name.trim()) {
        setErrorMsg("Full name is required");
        setLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        setErrorMsg("Email is required");
        setLoading(false);
        return;
      }

      const body = new FormData();
      body.append("name", formData.name);
      body.append("phoneNumber", formData.phoneNumber);
      body.append("email", formData.email);
      body.append("country", formData.country);
      body.append("division", formData.division);
      body.append("district", formData.district);
      body.append("thana", formData.thana);
      if (selectedFile) {
        body.append("profilePicture", selectedFile);
      }

      console.log("Updating user with:", {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        hasFile: !!selectedFile,
      });

      const result = await updateMe(body).unwrap();

      console.log("Update response:", result);

      setSuccessMsg(result.message || "Profile updated successfully!");
      setSelectedFile(null);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string }; status?: number };
      const errorMessage =
        apiError?.data?.message ||
        `Update failed${apiError?.status ? ` (${apiError.status})` : ""}. Please try again.`;
      setErrorMsg(errorMessage);
      console.log("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4" />
        <p className="text-muted-foreground text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="bg-card-primary mx-auto max-w-3xl overflow-hidden rounded-lg shadow-sm">
        {/* ── Avatar & title  */}
        <div className="border-border border-b p-12 text-center">
          <div
            className="border-success/5 group relative mx-auto mb-6 flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 shadow-sm transition-colors"
            onClick={handleImageClick}
          >
            {previewImage ? (
              <Image src={previewImage} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="bg-secondary text-muted-foreground flex h-full w-full items-center justify-center">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}

            {/* Camera overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <h1 className="mt-4 mb-2 text-2xl font-semibold">Personal Information</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Upload a profile picture or use the default placeholder.
          </p>

          <button
            type="button"
            onClick={handleImageClick}
            className="bg-button-primary text-button-primary-foreground cursor-pointer rounded-md px-6 py-2.5 text-sm font-medium transition-all"
          >
            Upload picture
          </button>
        </div>

        {/* ── Form  */}
        <form onSubmit={handleSubmit} className="p-8">
          <ProfileInfoSection formData={formData} handleChange={handleChange} />

          {/* Feedback banners */}
          {successMsg && (
            <div className="bg-success/10 border-success text-success-foreground mb-6 rounded-md border p-4 text-sm">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-danger/10 border-danger text-danger mb-6 rounded-md border p-4 text-sm">
              {errorMsg}
            </div>
          )}

          <AddressSection formData={formData} handleChange={handleChange} />

          {/* Submit */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-button-primary text-button-primary-foreground flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
