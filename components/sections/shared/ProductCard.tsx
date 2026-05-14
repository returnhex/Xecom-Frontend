"use client";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Loader2 } from "lucide-react";
import {
  useAddToWishlistMutation,
  useGetAllWishlistsQuery,
  useRemoveFromWishlistMutation,
} from "@/redux/features/product/wishlist.api";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  status: string;
  featured: boolean;
  avgRating: number | null;
  reviewCount: number;
  totalSales: number;
  tags: string[];
  minOrderQty?: number;
  maxOrderQty?: number;
  _count: { images: number; variants: number };
  variants?: {
    id: string;
    price: number;
    comparePrice?: number;
    color?: string;
    size?: string;
    stockQuantity?: number;
    images?: { url: string }[];
  }[];
  images?: { imageUrl: string; isFeatured: boolean }[];
};

type Props = {
  product: ApiProduct;
  viewMode: "grid" | "list";
  getBadgeColor: (badge?: string) => string;
};

export default function ProductCard({ product, viewMode, getBadgeColor }: Props) {
  // ─── Mutations ───
  const { data: wishlistData } = useGetAllWishlistsQuery(undefined);
  const [addToWishlist, { isLoading: isWishlisting }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isUnwishlisting }] = useRemoveFromWishlistMutation();

  // ─── Wishlist state ───
  const wishlistItem = wishlistData?.data?.find(
    (item: any) => item.productId === product.id || item.product?.id === product.id
  );
  const isWishlisted = !!wishlistItem;

  // ─── Derived data ───
  const primaryImage =
    product.images?.find((img) => img.isFeatured)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    "/placeholder-product.png";

  const badge = product.featured
    ? "FEATURED"
    : product.tags?.includes("new")
      ? "NEW"
      : product.tags?.includes("trending")
        ? "TRENDING"
        : null;

  const rating = product.avgRating ?? 0;

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted && wishlistItem?.id) {
        await removeFromWishlist(wishlistItem.id).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist({ productId: product.id }).unwrap();
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Wishlist action failed");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`/product/${product.id}`}
            className={`group bg-card-primary relative block transform overflow-hidden rounded-sm shadow-sm transition-all duration-500 hover:shadow-lg ${
              viewMode === "list" ? "flex flex-col md:flex-row" : ""
            }`}
          >
            {/* Badge */}
            <div
              className={`absolute top-2 left-2 z-10 rounded-full px-1 px-3 py-1 text-xs font-semibold text-black lg:top-4 lg:left-4 lg:font-bold ${getBadgeColor(badge)}`}
            >
              {product.tags?.[0] ?? "—"}
            </div>

            {/*  Wishlist button — top right */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlistToggle();
              }}
              disabled={isWishlisting || isUnwishlisting}
              className={`absolute top-4 right-4 ${
                viewMode === "list" ? "top-10" : "top-4"
              } right-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border shadow-sm transition-all hover:scale-110 disabled:opacity-60 ${
                isWishlisted
                  ? "border-danger/20 bg-danger/50"
                  : "border-border bg-white/80 backdrop-blur-sm"
              }`}
            >
              {isWishlisting || isUnwishlisting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isWishlisted ? "fill-danger text-danger" : "text-gray-600"
                  }`}
                />
              )}
            </button>

            {/* Image */}
            <div
              className={`relative block ${viewMode === "list" ? "md:w-64" : "h-35 lg:h-64"} img-primary-bg overflow-hidden`}
            >
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-contain transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Info */}
            <div className={`p-2 ${viewMode === "list" ? "flex-1" : ""}`}>
              {/* Rating row */}
              <div className="my-2 flex items-center justify-between">
                <span></span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={`text-rating ${i < Math.floor(rating) ? "fill-current" : "fill-none"}`}
                    />
                  ))}
                  <span className="ml-1 text-xs">({product.reviewCount})</span>
                </div>
              </div>

              {/* Name */}
              <div>
                <h3 className="tranding-secondry-text mb-1 line-clamp-2 font-semibold hover:underline">
                  {product.name}
                </h3>
              </div>

              {/* Short description */}
              <p className="text-muted-foreground mb-2 line-clamp-2 h-5 text-xs">
                {product.shortDescription}
              </p>
            </div>
          </Link>
        </TooltipTrigger>

        <TooltipContent side="top">
          <p>View details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
