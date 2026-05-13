"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useGetMeQuery, useUpdateMeMutation } from "@/redux/features/user/user.api";
import { TAdmin, TCustomer, TStaff } from "@/types";

interface ProfileFormData {
  name: string;
  phoneNumber: string;
  email: string;
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
  });


  const { data: userData, isLoading: fetchLoading, error: fetchError } = useGetMeQuery(undefined);


  useEffect(() => {
    if (!userData?.data) {
      if (fetchError) {
        console.error("Failed to fetch user data:", fetchError);
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

    setFormData({
      name,
      phoneNumber,
      email,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  // . Submit — PATCH /user/me ────────────────────────
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
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

 
  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto bg-card-primary rounded-lg shadow-sm overflow-hidden">

        {/* ── Avatar & title ─────────────────────────── */}
        <div className="p-12 text-center border-b border-border">

          <div
            className="relative w-32 h-32 mx-auto mb-6 border-4 shadow-sm border-success/5 rounded-full cursor-pointer overflow-hidden flex items-center justify-center group transition-colors"
            onClick={handleImageClick}
          >
            {previewImage ? (
              <Image
                src={previewImage}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-secondary text-muted-foreground">
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
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
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

          <h1 className="mt-4 mb-2 text-2xl font-semibold">
            Personal Information
          </h1>
          <p className="mb-6 text-muted-foreground text-sm">
            Upload a profile picture or use the default placeholder.
          </p>

          <button
            type="button"
            onClick={handleImageClick}
            className="px-6 py-2.5 rounded-md text-sm font-medium bg-button-primary text-button-primary-foreground cursor-pointer transition-all"
          >
            Upload picture
          </button>
        </div>

        {/* ── Form ───────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-8">

          {/* Row 1 — Full name */}
          <div className="mb-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-border rounded-md text-sm text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-button-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Row 2 — Phone / Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+8801XXXXXXXXX"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-border rounded-md text-sm text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-button-primary/30 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-border rounded-md text-sm text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-button-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Feedback banners */}
          {successMsg && (
            <div className="p-4 mb-6 bg-success/10 border border-success rounded-md text-success-foreground text-sm">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-4 mb-6 bg-danger/10 border border-danger rounded-md text-danger text-sm">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3.5 rounded-md text-sm font-semibold cursor-pointer bg-button-primary text-button-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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