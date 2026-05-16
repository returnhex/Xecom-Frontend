"use client";

import React from "react";
import Image from "next/image";
import { Camera, User, Phone, Mail, Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface ProfileInfoSectionProps {
  formData: {
    name: string;
    phoneNumber: string;
    email: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewImage: string | null;
  handleImageClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ProfileInfoSection = ({
  formData,
  handleChange,
  previewImage,
  handleImageClick,
  fileInputRef,
  handleFileChange,
  loading,
  onSubmit,
}: ProfileInfoSectionProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className="bg-card-primary border-border overflow-hidden rounded-lg border shadow-sm"
    >
      <div className="border-border border-b bg-linear-to-r from-transparent to-black/[0.02] p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <User className="text-primary h-5 w-5" />
          Personal Information
        </h2>
        <p className="text-muted-foreground text-sm">Manage your profile details and avatar.</p>
      </div>

      <form onSubmit={onSubmit} className="p-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column — Avatar */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-start gap-4 lg:col-span-4"
          >
            <div
              className="group relative h-48 w-48 cursor-pointer overflow-hidden rounded-2xl border-4 border-white shadow-xl ring-1 ring-black/5 transition-transform hover:scale-[1.02] dark:border-zinc-800"
              onClick={handleImageClick}
            >
              {previewImage ? (
                <Image src={previewImage} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="bg-secondary text-muted-foreground flex h-full w-full items-center justify-center">
                  <User size={64} strokeWidth={1} />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="mb-2 text-white" size={32} />
                <span className="text-xs font-medium text-white">Change Photo</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="text-center">
              <p className="text-sm font-semibold">Profile Picture</p>
              <p className="text-muted-foreground mt-1 text-[11px]">JPG, PNG or WEBP. Max 5MB.</p>
            </div>
          </motion.div>

          {/* Right Column — Fields */}
          <motion.div variants={itemVariants} className="space-y-6 lg:col-span-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User size={14} /> Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone size={14} /> Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+8801XXXXXXXXX"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  readOnly
                  placeholder="you@example.com"
                  value={formData.email}
                  className="h-11 cursor-not-allowed rounded-xl opacity-70"
                />
                <p className="text-muted-foreground text-[10px]">Email cannot be changed.</p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-button-primary text-button-primary-foreground flex min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Personal Info
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};

export default ProfileInfoSection;
