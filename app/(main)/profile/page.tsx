"use client";

import ProfileInfoSection from "./sections/ProfileInfoSection";
import AddressSection from "./sections/AddressSection";

export default function ProfilePage() {
  return (
    <div className="container min-h-screen">
      <div className="flex flex-col items-start justify-center gap-8 lg:flex-row">
        {/* Personal Information Card */}
        <div className="w-full lg:flex-1">
          <ProfileInfoSection />
        </div>

        {/* Address Information Card */}
        <div className="w-full lg:flex-1">
          <AddressSection />
        </div>
      </div>
    </div>
  );
}
