"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { TrendingUp, Trophy, Sparkles } from "lucide-react";
import SectionTitle from "@/components/sections/shared/SectionTitle";
import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
import ProductCard from "../../shared/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyCard from "@/components/custom/EmptyCard";
import Link from "next/link";

const PremiumShoes = (): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState<"trending" | "bestsellers" | "new">("trending");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const { data: ProductData, isLoading } = useGetAllProductsQuery([]);

  const allProducts = ProductData?.data || [];

  const trendingProducts = allProducts.slice(0, 10);
  const bestSellerProducts = allProducts.slice(10, 15);
  const newArrivalProducts = allProducts.slice(15, 20);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="group cart-sec-bg relative animate-pulse overflow-hidden rounded-sm shadow-sm"
        >
          <div className="absolute top-4 left-4 z-10">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="img-primary-bg relative h-34 overflow-hidden">
            <Skeleton className="absolute inset-0 h-full w-full" />
          </div>
          <div className="space-y-3 p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-5 w-2/3 rounded" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-5 w-12 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, idx) => (
                  <Skeleton key={idx} className="h-4 w-4 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <section className="container">
        <div className="mb-12 text-center">
          <SectionTitle subtitle="Sneaker" title="Premium Sneaker Collection" className="mb-2" />
        </div>
        {renderSkeletonGrid()}
      </section>
    );
  }

  const productsMap = {
    trending: trendingProducts,
    bestsellers: bestSellerProducts,
    new: newArrivalProducts,
  };

  const activeProducts = productsMap[activeTab];

  return (
    <section ref={sectionRef} className="container">
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <SectionTitle subtitle="Sneaker" title="Premium Footwear Collection" className="mb-2" />
        </div>
        {/* Tabs */}
        <div className="mb-8 flex justify-center">
          <div className="flex flex-row">
            {[
              {
                id: "trending",
                label: "Trending Now",
                count: trendingProducts.length,
                icon: <TrendingUp className="h-3 w-3 lg:h-5 lg:w-5" />,
              },
              {
                id: "bestsellers",
                label: "Best Sellers",
                count: bestSellerProducts.length,
                icon: <Trophy className="h-3 w-3 lg:h-5 lg:w-5" />,
              },
              {
                id: "new",
                label: "New Arrivals",
                count: newArrivalProducts.length,
                icon: <Sparkles className="h-3 w-3 lg:h-5 lg:w-5" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "trending" | "bestsellers" | "new")}
                className={`flex cursor-pointer items-center space-x-1 px-3 py-2 text-sm font-semibold md:space-x-2 lg:px-6 lg:py-4 ${
                  activeTab === tab.id ? "border-b-2 border-black dark:border-white" : ""
                }`}
              >
                {tab.icon}
                <span className="text-xs md:text-sm">{tab.label}</span>
                <span className="rounded-full px-2 py-1 text-xs">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Grid or Empty State */}
        {activeProducts.length === 0 ? (
          <EmptyCard></EmptyCard>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {activeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={
                  {
                    ...product,
                    rating: product.avgRating ?? 0,
                    reviews: product.reviewCount ?? 0,
                  } as any
                }
                viewMode="grid"
                getBadgeColor={(badge?: string) => {
                  switch (badge) {
                    case "BEST SELLER":
                      return "bg-danger text-danger-foreground";
                    case "NEW":
                      return "bg-success text-success-foreground";
                    case "TRENDING":
                      return "bg-rating text-rating-foreground";
                    case "LIMITED":
                      return "bg-warning text-warning-foreground";
                    default:
                      return "bg-success text-success-foreground";
                  }
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/products"
            className="group relative hover:text-white border-b-2 dark:hover:text-black rounded-full px-6 py-3 text-sm font-semibold"
          >
            <span className="absolute bottom-0 left-0 h-[2px] rounded-full w-full bg-black transition-all duration-300 group-hover:h-full group-hover:border group-hover:border-black  dark:bg-white dark:group-hover:border-white"></span>
            <span className="relative   z-10">View All Products</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PremiumShoes;
