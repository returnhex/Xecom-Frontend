"use client";

import React from "react";

interface ProfileInfoSectionProps {
  formData: {
    name: string;
    phoneNumber: string;
    email: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileInfoSection = ({ formData, handleChange }: ProfileInfoSectionProps) => {
  return (
    <div className="mb-6">
      <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
      {/* Row 1 — Full name */}
      <div className="mb-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border-border text-secondary-foreground focus:ring-button-primary/30 rounded-md border px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Row 2 — Phone / Email */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="phoneNumber" className="text-sm font-medium">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="+8801XXXXXXXXX"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="border-border text-secondary-foreground focus:ring-button-primary/30 rounded-md border px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="border-border text-secondary-foreground focus:ring-button-primary/30 rounded-md border px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoSection;
