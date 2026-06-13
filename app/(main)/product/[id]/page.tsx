"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  Truck,
  ZoomIn,
  Heart,
  Share2,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Star,
  Package,
  Eye,
  Loader2,
} from "lucide-react";
import ProductSugation from "./sections/ProductSuggestion";
import ProductReviews from "./sections/ProductReview";
import { useParams } from "next/navigation";
import { useGetSingleProductQuery } from "@/redux/features/product/product.api";
import {
  useAddToCartMutation,
  useAddToGuestCartMutation,
  useCreateGuestTokenMutation,
} from "@/redux/features/order/cart.api";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useAddToWishlistMutation,
  useGetAllWishlistsQuery,
  useRemoveFromWishlistMutation,
} from "@/redux/features/product/wishlist.api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ProtectedRoute from "@/route/ProtectedRoute";
import { UserRole } from "@/constants/enum";

export default function ProductDetails() {
  const params = useParams();
  const id = params.id as string;

  const { data: apiResponse, isLoading } = useGetSingleProductQuery(id);
  const product = apiResponse?.data;

  const user = useAppSelector(selectCurrentUser);
  const [addToCart, { isLoading: isCartLoading }] = useAddToCartMutation();
  const [createGuestToken, { isLoading: isCreatingToken }] = useCreateGuestTokenMutation();
  const [addToGuestCart, { isLoading: isGuestCartLoading }] = useAddToGuestCartMutation();
  const isAddingToCart = isCartLoading || isCreatingToken || isGuestCartLoading;
  const { data: wishlistData } = useGetAllWishlistsQuery(undefined);
  const [addToWishlist, { isLoading: isWishlisting }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isUnwishlisting }] = useRemoveFromWishlistMutation();
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "shipping">("description");

  const imageRef = useRef<HTMLDivElement>(null);
  const zoomBoxRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  // Derive wishlist state from API data
  const wishlistItem = wishlistData?.data?.find(
    (item: any) => item.productId === id || item.product?.id === id
  );
  const isWishlisted = !!wishlistItem;

  // Add this handler:
  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted && wishlistItem?.id) {
        await removeFromWishlist(wishlistItem.id).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist({ productId: id }).unwrap();
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Wishlist action failed");
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container flex items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">Product not found.</p>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      toast.error("Please select a variant");
      return;
    }

    try {
      if (user) {
        await addToCart({ variantId: selectedVariant.id, quantity }).unwrap();
      } else {
        let token = localStorage.getItem("guestToken");
        if (!token) {
          const tokenResult = await createGuestToken(undefined).unwrap();
          token = (tokenResult as any)?.guestToken ?? "";
          if (token) {
            localStorage.setItem("guestToken", token);
            window.dispatchEvent(new StorageEvent("storage", { key: "guestToken", newValue: token }));
          }
        }
        if (token) {
          await addToGuestCart({ variantId: selectedVariant.id, quantity, guestToken: token }).unwrap();
        }
      }
      toast.success(`${product.name} added to cart!`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add to cart.");
    }
  };

  // Derived data from API response
  const productImages = product.images ?? [];
  const currentImage = productImages[selectedImage]?.imageUrl ?? "";
  const variants = product.variants ?? [];
  const selectedVariant = variants[selectedVariantIndex] ?? variants[0];
  const price = selectedVariant?.price ?? "N/A";
  const cost = selectedVariant?.cost ?? null;
  const sku = selectedVariant?.sku ?? "N/A";
  const stockQty = selectedVariant?.stockQuantity ?? 0;
  const stockAlert = selectedVariant?.stockAlertThreshold ?? 10;

  // Build unique sizes and colors from all variants
  const allSizes: string[] = [];
  const allColors: { value: string; hex: string | null }[] = [];

  // Build dynamic attribute groups
  const attributeGroups: Record<string, any[]> = {};

  variants.forEach((variant: any) => {
    variant.attributes?.forEach((attr: any) => {
      const name = attr.attributeValue?.attribute?.name;
      const value = attr.attributeValue?.value;
      const hex = attr.attributeValue?.hexCode ?? null;

      if (!attributeGroups[name]) {
        attributeGroups[name] = [];
      }

      const exists = attributeGroups[name].find((v) => v.value === value);

      if (!exists) {
        attributeGroups[name].push({
          value,
          hex,
        });
      }
    });
  });

  const selectedSize =
    selectedVariant?.attributes?.find(
      (a: any) => a.attributeValue?.attribute?.name?.toLowerCase() === "size"
    )?.attributeValue?.value ?? "";

  const selectedColor =
    selectedVariant?.attributes?.find(
      (a: any) => a.attributeValue?.attribute?.name?.toLowerCase() === "color"
    )?.attributeValue?.value ?? "";

  // Find variant by size selection
  const handleSizeSelect = (size: string) => {
    const idx = variants.findIndex((v: any) =>
      v.attributes?.some(
        (a: any) =>
          a.attributeValue?.attribute?.name?.toLowerCase() === "size" &&
          a.attributeValue?.value === size
      )
    );
    if (idx !== -1) setSelectedVariantIndex(idx);
  };

  // Find variant by color selection — updates SKU + price + stock
  const handleColorSelect = (colorValue: string) => {
    const idx = variants.findIndex((v: any) =>
      v.attributes?.some(
        (a: any) =>
          a.attributeValue?.attribute?.name?.toLowerCase() === "color" &&
          a.attributeValue?.value === colorValue
      )
    );
    if (idx !== -1) setSelectedVariantIndex(idx);
  };

  const specs = product.specifications ?? {};
  const faqs = product.faqs ?? [];

  // Stock status helper
  const getStockStatus = () => {
    if (stockQty === 0)
      return { label: "Out of Stock", color: "text-red-500 bg-red-50 border-red-200" };
    if (stockQty <= stockAlert)
      return {
        label: `Only ${stockQty} left`,
        color: "text-orange-500 bg-orange-50 border-orange-200",
      };
    return { label: "In Stock", color: "text-green-600 bg-green-50 border-green-200" };
  };
  const stockStatus = getStockStatus();

  // Discount calculation
  const discountPercent =
    cost && price !== "N/A" && parseFloat(cost) > parseFloat(price)
      ? Math.round(((parseFloat(cost) - parseFloat(price)) / parseFloat(cost)) * 100)
      : null;

  const formattedPrice = price !== "N/A" ? Number(price).toFixed(2) : "N/A";
  const formattedCost = cost ? Number(cost).toFixed(2) : null;
  const averageRating = Number(product.avgRating);
  const hasAverageRating = Number.isFinite(averageRating) && averageRating > 0;

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground mb-6 flex items-center gap-2 text-xs">
        <span className="hover:text-foreground cursor-pointer transition-colors">Home</span>
        <span>/</span>
        {product.category?.name && (
          <>
            <span className="hover:text-foreground cursor-pointer transition-colors">
              {product.category.name}
            </span>
            <span>/</span>
          </>
        )}
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* ─── LEFT: Images + Tabs below ─── */}
        <div>
          {/* Image area */}
          <div className="relative flex-row gap-6 md:flex">
            {/* Thumbnail Images */}
            <div className="flex flex-row gap-3 py-5 md:-mt-5 md:flex-col">
              {productImages.map((image: any, index: number) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-card-primary relative h-20 w-20 cursor-pointer overflow-hidden rounded-md border-2 transition-all ${
                    selectedImage === index
                      ? "border-black shadow-md"
                      : "border-border hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={image.imageUrl}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>

            {/* Main Image with Hover Zoom Preview */}
            <div
              ref={imageRef}
              className="group bg-card-primary relative h-120 w-full cursor-crosshair overflow-hidden rounded-lg"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
            >
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="aspect-square object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}

              {/* Hover Zoom Lens Effect */}
              {isHovering && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at ${zoomPosition.x}% ${zoomPosition.y}%, transparent 30%, rgba(0,0,0,0.1) 100%)`,
                  }}
                />
              )}

              {/* Zoom Indicator Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-colors group-hover:opacity-100">
                <div className="flex scale-90 transform items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-gray-900 shadow-lg backdrop-blur-sm transition-all group-hover:scale-100">
                  <ZoomIn className="h-4 w-4" />
                  <span className="text-sm font-medium">Hover to preview</span>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white shadow">
                    Featured
                  </span>
                )}
                {discountPercent && (
                  <span className="bg-danger text-danger-foreground rounded-full px-3 py-1 text-xs font-bold shadow">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {/* View Count */}
              {product.viewCount > 0 && (
                <div className="absolute right-4 bottom-4 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  <Eye className="h-3 w-3" />
                  <span>{product.viewCount} views</span>
                </div>
              )}
            </div>

            {/* Hover Zoom Preview Box */}
            {isHovering && currentImage && (
              <div
                ref={zoomBoxRef}
                className="absolute top-70 left-[calc(95%+2rem)] z-30 hidden h-140 w-full -translate-y-1/2 overflow-hidden rounded-lg border-2 border-white bg-white shadow-2xl lg:block"
                style={{ marginLeft: "1rem" }}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="320px"
                    style={{
                      transform: `scale(2.5) translate(${50 - zoomPosition.x}%, ${50 - zoomPosition.y}%)`,
                      transition: "transform 0.05s ease-out",
                    }}
                  />
                  <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
                    2.5x Zoom
                  </div>
                  <div className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white opacity-50" />
                </div>
              </div>
            )}
          </div>

          {/* ─── Tabbed Product Info — UNDER the image ─── */}
          <div className="mt-8">
            <div className="border-border mb-4 flex border-b">
              {(["description", "specs", "shipping"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-black dark:border-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "specs" ? "Specifications" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="space-y-4">
                <p className="detailsPage-text-primary text-sm leading-relaxed">
                  {product.fullDescription || product.shortDescription}
                </p>
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {product.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="border-border bg-card-primary rounded-full border px-3 py-1 text-xs capitalize"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {(product.weight || product.dimension) && (
                  <div className="border-border bg-card-primary grid grid-cols-2 gap-3 rounded-lg border p-3">
                    {product.weight && (
                      <div>
                        <p className="text-muted-foreground mb-0.5 text-xs">Weight</p>
                        <p className="text-sm font-medium">
                          {product.weight} {product.weightUnit}
                        </p>
                      </div>
                    )}
                    {product.dimension && (
                      <div>
                        <p className="text-muted-foreground mb-0.5 text-xs">Dimensions</p>
                        <p className="text-sm font-medium">
                          {product.dimension.length} × {product.dimension.width} ×{" "}
                          {product.dimension.height} {product.dimension.unit}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Specs Tab */}
            {activeTab === "specs" && (
              <div className="bg-card-primary overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(specs).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? "bg-muted/40" : "bg-background"}>
                        <td className="border-border w-2/5 border-r px-4 py-3 font-medium capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </td>
                        <td className="px-4 py-3 font-medium">{value as string}</td>
                      </tr>
                    ))}
                    {selectedVariant?.attributes?.map((attr: any, idx: number) => {
                      const name = attr.attributeValue?.attribute?.name;
                      const val = attr.attributeValue?.value;
                      const alreadyInSpecs = Object.keys(specs).some(
                        (k) => k.toLowerCase() === name?.toLowerCase()
                      );
                      if (alreadyInSpecs) return null;
                      return (
                        <tr
                          key={attr.id}
                          className={
                            (Object.keys(specs).length + idx) % 2 === 0
                              ? "bg-muted/40"
                              : "bg-background"
                          }
                        >
                          <td className="border-border w-2/5 border-r px-4 py-3 font-medium capitalize">
                            {name}
                          </td>
                          <td className="px-4 py-3 font-medium">{val}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === "shipping" && (
              <div className="space-y-3 text-sm">
                <div className="border-border bg-card-primary flex items-start gap-3 rounded-lg border p-3">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Standard Delivery</p>
                    <p className="text-muted-foreground text-xs">
                      3-5 business days · Free above TK. 8000
                    </p>
                  </div>
                </div>
                <div className="border-border bg-card-primary flex items-start gap-3 rounded-lg border p-3">
                  <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Return Policy</p>
                    <p className="text-muted-foreground text-xs">
                      15-day hassle-free returns on unused items
                    </p>
                  </div>
                </div>
                {product.warranty && (
                  <div className="border-border bg-card-primary flex items-start gap-3 rounded-lg border p-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-medium">Warranty</p>
                      <p className="text-muted-foreground text-xs">{product.warranty}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: Product Details ─── */}
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="mb-2 flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Brand + Category chips */}
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {product.brand?.name && (
                    <span className="detailsPage-text-primary rounded border px-2 py-0.5 text-xs font-semibold tracking-wider uppercase">
                      {product.brand.name}
                    </span>
                  )}
                  {product.category?.name && (
                    <span className="text-muted-foreground text-xs">{product.category.name}</span>
                  )}
                </div>
                <h1 className="mb-2 text-xl leading-tight font-bold lg:text-3xl">{product.name}</h1>
                <p className="text-muted-foreground text-sm">{product.shortDescription}</p>
              </div>
              {/* Wishlist + Share */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={handleWishlistToggle}
                  disabled={isWishlisting || isUnwishlisting}
                  className={`border-border flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isWishlisted ? "border-danger/20 bg-danger/50" : "hover:bg-muted"
                  }`}
                >
                  {isWishlisting || isUnwishlisting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        isWishlisted ? "fill-danger text-danger" : ""
                      }`}
                    />
                  )}
                </button>
                <button className="border-border hover:bg-muted flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all hover:scale-110">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* SKU + Rating row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                {product.totalSales > 0 && (
                  <>
                    <span>•</span>
                    <span>{product.totalSales} sold</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        hasAverageRating && i < Math.floor(averageRating)
                          ? "fill-rating text-rating"
                          : "fill-muted text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">
                  {product.avgRating ? Number(product.avgRating).toFixed(1) : "No rating"}{" "}
                  <span className="text-xs">({product.reviewCount ?? 0} reviews)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="border-border bg-card-primary mb-6 rounded-xl border p-4">
            <div className="mb-2 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-bold lg:text-4xl">TK. {formattedPrice}</span>
              {cost && parseFloat(cost) > parseFloat(price) && (
                <span className="text-muted-foreground text-lg line-through">
                  TK. {parseFloat(formattedCost).toFixed(2)}
                </span>
              )}
              {discountPercent && (
                <span className="bg-button-ternary rounded px-2 py-0.5 text-sm font-bold text-green-700">
                  Save {discountPercent}%
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold ${stockStatus.color}`}
              >
                <Package className="h-3 w-3" />
                {stockStatus.label}
              </span>
              {product.warranty && (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                  {product.warranty}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground mt-2 mb-4 text-sm">
              SKU: <span className="font-mono font-semibold">{sku}</span>
            </p>
            <TooltipProvider>
              <Tooltip>
                <Dialog>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <button className="flex cursor-pointer items-center gap-1 text-xs underline underline-offset-2">
                        Size Chart
                      </button>
                    </DialogTrigger>
                  </TooltipTrigger>

                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Size Chart</DialogTitle>
                    </DialogHeader>

                    <div className="overflow-x-auto">
                      <table className="w-full border text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2">Size</th>
                            <th className="border p-2">Foot Length (cm)</th>
                            <th className="border p-2">Foot Width (cm)</th>
                            <th className="border p-2">US Equivalent</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td className="border p-2 text-center">XS</td>
                            <td className="border p-2 text-center">22 - 23</td>
                            <td className="border p-2 text-center">8.5 - 9</td>
                            <td className="border p-2 text-center">4 - 5</td>
                          </tr>

                          <tr>
                            <td className="border p-2 text-center">S</td>
                            <td className="border p-2 text-center">23 - 24</td>
                            <td className="border p-2 text-center">9 - 9.2</td>
                            <td className="border p-2 text-center">6 - 7</td>
                          </tr>

                          <tr>
                            <td className="border p-2 text-center">M</td>
                            <td className="border p-2 text-center">24 - 26</td>
                            <td className="border p-2 text-center">9.2 - 9.6</td>
                            <td className="border p-2 text-center">8 - 9</td>
                          </tr>

                          <tr>
                            <td className="border p-2 text-center">L</td>
                            <td className="border p-2 text-center">26 - 28</td>
                            <td className="border p-2 text-center">9.6 - 10</td>
                            <td className="border p-2 text-center">10 - 11</td>
                          </tr>

                          <tr>
                            <td className="border p-2 text-center">XL</td>
                            <td className="border p-2 text-center">28 - 30</td>
                            <td className="border p-2 text-center">10 - 10.5</td>
                            <td className="border p-2 text-center">12 - 13</td>
                          </tr>

                          <tr>
                            <td className="border p-2 text-center">XXL</td>
                            <td className="border p-2 text-center">30 - 31</td>
                            <td className="border p-2 text-center">10.5 - 11</td>
                            <td className="border p-2 text-center">14</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </DialogContent>
                </Dialog>

                <TooltipContent side="top">
                  <p>Click to view size chart</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* all attributes */}
          {Object.entries(attributeGroups).map(([attrName, values]) => {
            const isColor = attrName.toLowerCase() === "color";
            const isSize = attrName.toLowerCase() === "size";

            // Get currently selected value for this attribute from selected variant
            const selectedValue =
              selectedVariant?.attributes?.find(
                (a: any) =>
                  a.attributeValue?.attribute?.name?.toLowerCase() === attrName.toLowerCase()
              )?.attributeValue?.value ?? "";

            const handleSelect = (value: string) => {
              // Find variant that matches ALL currently selected attributes + this new one
              const idx = variants.findIndex((v: any) =>
                v.attributes?.some(
                  (a: any) =>
                    a.attributeValue?.attribute?.name?.toLowerCase() === attrName.toLowerCase() &&
                    a.attributeValue?.value === value
                )
              );
              if (idx !== -1) setSelectedVariantIndex(idx);
            };

            return (
              <div key={attrName} className="mb-6">
                <h3 className="mb-3 font-semibold">
                  {attrName}:{" "}
                  <span className="text-muted-foreground font-normal">{selectedValue}</span>
                </h3>

                {/* Color swatches */}
                {isColor && (
                  <div className="flex flex-wrap gap-3">
                    {values.map((v) => (
                      <button
                        key={v.value}
                        title={v.value}
                        onClick={() => handleSelect(v.value)}
                        className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 transition-all hover:scale-110 ${
                          selectedValue === v.value
                            ? "scale-110 border-black shadow-md"
                            : "border-border"
                        }`}
                        style={{ backgroundColor: v.hex ?? "#e5e7eb" }}
                      >
                        {selectedValue === v.value && (
                          <span className="text-xs font-bold text-white">✓</span>
                        )}
                        {!v.hex && <span className="text-xs font-medium">{v.value.charAt(0)}</span>}
                      </button>
                    ))}
                  </div>
                )}

                {/* Size buttons */}
                {isSize && (
                  <div className="flex flex-wrap gap-3">
                    {values.map((v) => (
                      <button
                        key={v.value}
                        onClick={() => handleSelect(v.value)}
                        className={`flex h-10 w-14 cursor-pointer items-center justify-center rounded-lg border-2 font-medium transition-all lg:h-14 ${
                          selectedValue === v.value
                            ? "border-black bg-black text-white"
                            : "border-border bg-white text-black hover:border-gray-400"
                        }`}
                      >
                        {v.value}
                      </button>
                    ))}
                  </div>
                )}

                {/* Other attributes (material, etc.) */}
                {!isColor && !isSize && (
                  <div className="flex flex-wrap gap-2">
                    {values.map((v) => (
                      <button
                        key={v.value}
                        onClick={() => handleSelect(v.value)}
                        className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                          selectedValue === v.value
                            ? "border-black bg-black text-white"
                            : "border-border bg-white text-black hover:border-gray-400 dark:bg-transparent dark:text-white"
                        }`}
                      >
                        {v.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Actions */}
          <div className="mb-6">
            <div className="flex w-full flex-col gap-4 md:flex-row">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || stockQty === 0}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-black font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:flex-1"
              >
                {isAddingToCart ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                )}
                {isAddingToCart ? "Adding..." : stockQty === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                // onClick={handleBuyNow}
                disabled={isAddingToCart || stockQty === 0}
                className="hover:bg-muted h-12 w-full cursor-pointer rounded-lg border-2 border-black px-6 font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                Buy Now
              </button>
            </div>
            <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
              {product.minOrderQty && <span>Min order: {product.minOrderQty}</span>}
              {product.maxOrderQty && <span>Max order: {product.maxOrderQty}</span>}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="border-border bg-card-primary mb-6 grid grid-cols-3 gap-3 rounded-xl border p-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <Truck className="text-button-ternary h-5 w-5" />
              <span className="text-xs font-medium">Free Delivery</span>
              <span className="text-muted-foreground text-xs">Above TK. 8000</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <RotateCcw className="text-button-ternary h-5 w-5" />
              <span className="text-xs font-medium">Easy Returns</span>
              <span className="text-muted-foreground text-xs">15 day policy</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <span className="text-xs font-medium">Secure Pay</span>
              <span className="text-muted-foreground text-xs">100% protected</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-button-ternary/5 mb-6 rounded-lg p-4">
            <div className="mb-2 flex items-center gap-3">
              <Truck className="text-button-ternary h-5 w-5" />
              <span className="text-button-ternary font-medium">
                FREE DELIVERY on orders above TK. 8000
              </span>
            </div>
            <div className="text-button-ternary text-sm">
              <p className="mb-1">✓ Free shipping across Bangladesh</p>
              <p>✓ Estimated delivery: 3-5 business days</p>
            </div>
          </div>

          {/* Store Availability */}
          <div className="mb-8">
            <button className="border-border bg-muted hover:bg-muted flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border py-3 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Check Store availability
            </button>
          </div>

          {/* ─── FAQs Accordion ─── */}
          {faqs.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 font-semibold">Frequently Asked Questions</h3>
              <div className="divide-border divide-y overflow-hidden rounded-xl border">
                {faqs.map((faq: any, index: number) => (
                  <div key={faq.id}>
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="hover:bg-muted/50 bg-card-primary flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left transition-colors"
                    >
                      <span className="text-sm font-medium">{faq.question}</span>
                      {openFaqIndex === index ? (
                        <ChevronUp className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                    {openFaqIndex === index && (
                      <div className="bg-muted/30 border-border border-t px-4 py-3">
                        <p className="detailsPage-text-primary text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detailsPage-text-primary text-center text-xs">
            <p>Product color may slightly vary, depending on your screen resolution</p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <ProductSugation />
        <ProductReviews productId={id} />
      </div>
    </div>
  );
}

//  productId={id}
