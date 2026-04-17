"use client";

import Image from "next/image";
import SectionTitle from "@/components/sections/shared/SectionTitle";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
import EmptyCard from "@/components/custom/EmptyCard";
import { Package, Star } from "lucide-react";

export default function BestCollection() {
  const { data: ProductData, isLoading } = useGetAllProductsQuery([
    { name: "isBestCollection", value: "true" },
  ]);

  const products = ProductData?.data || [];

  console.log("Best Collection Products:", products);

  return (
    <section className="container">
      <SectionTitle subtitle="Featured Products" title="Our Best Collection" />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:mt-30 lg:grid-cols-5 lg:space-y-15 lg:gap-4">
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
              href={`/product/${item.id}`}
              key={item.id}
              className="group dark:shadow-2xl shadow-lg relative cursor-pointer rounded-xl border-2 p-3 text-center transition hover:shadow-xl lg:h-[250px]"
            >
              {/* Image */}
              <div className="relative h-30 lg:h-52 transition-transform duration-300 group-hover:scale-110 lg:-mt-25">
                {item.images?.length > 0 ? (
                  <Image
                    src={item.images[0]?.imageUrl}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-6 w-6 opacity-50" />
                  </div>
                )}
              </div>

            

              {/* Name */}
              <h4 className="line-clamp-1 text-sm lg:text-xl font-medium">{item.name}</h4>
              <p className="line-clamp-1 text-sm font-medium ">{item.shortDescription}</p>

              {/* Rating */}
             <div className="flex items-center mt-5 justify-evenly">
               <div className="mt-1 flex items-center justify-center gap-1 text-xs lg:text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{item.avgRating ?? 0}</span>
                <span className="text-muted-foreground">({item.reviewCount})</span>
              </div>
              <p className="text-danger  mt-1 text-sm lg:text-lg font-semibold">৳ {item.price ?? 999}</p>
             </div>
            </Link>
          ))}
      </div>
    </section>
  );
}
