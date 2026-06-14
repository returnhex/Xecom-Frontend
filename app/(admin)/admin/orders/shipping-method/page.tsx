"use client";

import Title from "@/components/sections/shared/Title";
import { Button } from "@/components/ui/button";
import { TShippingMethod } from "@/types/order.type";
import { Plus } from "lucide-react";
import { useState } from "react";
import ShippingMethodTable from "./sections/ShippingMethodTable";
import ShippingMethodModal from "./sections/ShippingMethodModal";

export default function ShippingMethods() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<TShippingMethod | null>(
    null
  );

  const handleAddClick = () => {
    setSelectedShippingMethod(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (shippingMethod: TShippingMethod) => {
    setSelectedShippingMethod(shippingMethod);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Title
          mainTitle="All Shipping Methods"
          subTitle="Manage shipping methods and their organization"
        />

        <Button onClick={handleAddClick} className="w-fit gap-2">
          <Plus className="h-4 w-4" />
          Add Shipping Method
        </Button>
      </div>

      <div className="mt-4 lg:mt-6">
        <ShippingMethodTable onEdit={handleEditClick} />
      </div>

      {/* Shipping Method Modal */}
      <ShippingMethodModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        shippingMethod={selectedShippingMethod}
      />
    </>
  );
}
