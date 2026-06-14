"use client";

import Title from "@/components/sections/shared/Title";
import { Button } from "@/components/ui/button";
import { TCoupon } from "@/types/marketing.type";
import { Plus } from "lucide-react";
import { useState } from "react";
import CouponTable from "./sections/CouponTable";
import CouponModal from "./sections/CouponModal";

export default function Coupons() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<TCoupon | null>(null);

  const handleAddClick = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (coupon: TCoupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Title mainTitle="All Coupons" subTitle="Manage coupons and their organization" />

        <Button onClick={handleAddClick} className="w-fit gap-2">
          <Plus className="h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      <div className="mt-4 lg:mt-6">
        <CouponTable onEdit={handleEditClick} />
      </div>

      {/* Coupon Modal */}
      <CouponModal open={isModalOpen} onOpenChange={setIsModalOpen} coupon={selectedCoupon} />
    </>
  );
}
