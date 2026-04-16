"use client";

import Image from "next/image";
import SectionTitle from "@/components/sections/shared/SectionTitle";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
import EmptyCard from "@/components/custom/EmptyCard";

export default function BestCollection() {
  const { data: ProductData, isLoading } = useGetAllProductsQuery([
    { name: "isBestCollection", value: "true" },
  ]);

  const products = ProductData?.data || [];

  return (
    <section className="container">
      <SectionTitle subtitle="Featured Products" title="Our Best Collection" />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:mt-30 lg:grid-cols-6 lg:gap-4">
        {/*  Skeleton Loading */}
        {isLoading &&
          Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-card-primary rounded-xl border-2 p-2">
              <Skeleton className="h-40 w-full rounded-md" />
              <div className="mt-3 space-y-2">
                <Skeleton className="mx-auto h-4 w-3/4" />
                <Skeleton className="mx-auto h-4 w-1/2" />
              </div>
            </div>
          ))}

        {/*  No Data Found */}
        {!isLoading && products.length === 0 && <EmptyCard></EmptyCard>}

        {/*  Product List */}
        {!isLoading &&
          products.map((item: any) => (
            <Link
              href={`/product-details/${item._id}`}
              key={item._id}
              className="group bg-card-primary relative max-w-90 cursor-pointer rounded-xl border-2 p-2 text-center hover:shadow-xl lg:h-50"
            >
              <div className="relative h-40 transition-transform duration-300 group-hover:scale-110 lg:-mt-25">
                <Image src={item.image} alt={item.title} fill className="object-contain" />
              </div>

              <div className="mb-2 flex justify-center gap-1">
                <span className="bg-danger h-2 w-2 rounded-full" />
                <span className="bg-success-foreground h-2 w-2 rounded-full" />
                <span className="bg-rating h-2 w-2 rounded-full" />
                <span className="bg-success-foreground h-2 w-2 rounded-full" />
              </div>

              <h4 className="text-sm font-medium">{item.title}</h4>
              <p className="text-danger mt-1 text-sm font-semibold">{item.price}</p>
            </Link>
          ))}
      </div>
    </section>
  );
}
