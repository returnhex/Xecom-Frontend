import { ProductRelationType, ProductStatus, TargetAudience } from "@/constants/enum";

// ========================================
// PRODUCT CATALOG MANAGEMENT
// ========================================

export type TCategory = {
  id: string;
  tenantId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  targetAudience: TargetAudience[];
  _count: {
    products: number;
  };
};

export type TBrand = {
  id: string;
  tenantId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  isActive: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
};

export type TDimension = {
  id?: string;
  productId?: string;
  length: string;
  width: string;
  height: string;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
};

// ── Attribute types (nested inside variant) ──────────────────────────────────

export type TAttributeInfo = {
  id: string;
  name: string;
  createdAt?: string;
};
type TAttributeValues = {
  id: string;
  value: string;
};

export type TAttributeValueId = {
  id: string;
  name: string;
  values: TAttributeValues[];
};

export type TAttributeValueFull = {
  id: string;
  attributeId: { id: string; value: string };
  value: string;
  hexCode?: string | null;
  attribute: TAttributeInfo;
};

export type TVariantAttribute = {
  id: string;
  variantId: string;
  attributeValueId: string;
  attributeValue: TAttributeValueFull;
};

// ── Variant (full object as returned by the API) ─────────────────────────────

export type TProductVariantFull = {
  id: string;
  productId: string;
  sku: string;
  price: string;
  cost?: string | null;
  stockQuantity: number;
  stockAlertThreshold: number;
  isDefault: boolean;
  createdAt: string;
  attributes: TVariantAttribute[];
};

// ── Flat variant type (used in list/table views) ─────────────────────────────

export type TProductVariant = {
  id: string;
  productId: string;
  sku: string;
  price: string;
  cost?: string | null;
  stockQuantity: number;
  stockAlertThreshold: number;
  isDefault: boolean;
  createdAt: string;
};

// ── Product image ─────────────────────────────────────────────────────────────

export type TProductImage = {
  id: string;
  productId: string;
  imageUrl: string;
  isFeatured: boolean;
  createdAt: string;
};

// ── FAQ ───────────────────────────────────────────────────────────────────────

export type TProductFaq = {
  id: string;
  productId: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

// ── Top-level attribute (used in product list cards) ─────────────────────────

export type TProductAttribute = {
  id: string;
  attributeValue: {
    value: string;
    hexCode?: string | null;
    attribute: {
      name: string;
    };
  };
};

export type TFilterAttribute = {
  id: string;
  name: string;
  values: {
    id: string;
    value: string;
  }[];
};

// ── Main product type ─────────────────────────────────────────────────────────

export type TProduct = {
  id: string;
  tenantId?: string | null;
  name: string;

  // ✅ FIX: variants is an array of full variant objects, NOT string[]
  variants: TProductVariantFull[];

  slug: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  brandId?: string | null;
  categoryId?: string | null;
  brand?: TBrand | null;
  category?: TCategory | null;

  // ✅ FIX: images uses TProductImage shape (imageUrl, not url)
  images?: TProductImage[];

  // ✅ FIX: faqs is a proper typed array (was faqData: any)
  faqs?: TProductFaq[];

  dimension?: TDimension | null;

  status: ProductStatus;
  featured: boolean;
  weight?: string | null;
  tags: string[];
  isBestCollection: boolean;

  // ✅ FIX: weightUnit is a string ("KG", "G", etc.), not number
  weightUnit: string;

  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords: string[];
  warranty?: string | null;
  specifications: Record<string, string>;
  videoUrl?: string | null;
  manualUrl?: string | null;
  minOrderQty: number;
  maxOrderQty?: number | null;
  isBundle: boolean;
  totalSales: number;
  viewCount: number;
  avgRating?: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;

  // ✅ FIX: attributes typed properly (used in product list/card views)
  attributes: TProductAttribute[];

  _count?: {
    images: number;
    variants: number;
  };
};

// ── Other catalog types ───────────────────────────────────────────────────────

export type TBundleItem = {
  id: string;
  bundleId: string;
  productId: string;
  quantity: number;
  discount: string;
  createdAt: string;
};

export type TProductRelation = {
  id: string;
  tenantId?: string | null;
  productId: string;
  relatedToId: string;
  type: ProductRelationType;
  priority: number;
  createdAt: string;
};

export type TAttribute = {
  id: string;
  name: string;
  values?: TAttributeValue[];
  createdAt?: string;
};

export type TAttributeValue = {
  id: string;
  attributeId: string;
  value: string;
  hexCode?: string | null;
};

export type TProductVariantAttribute = {
  id: string;
  variantId: string;
  attributeValueId: string;
};

export type TReview = {
  id: string;
  productId: string;
  customerId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  isApproved: boolean;
  createdAt: string;
  customer?: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      profilePicture?: string | null;
    };
  };
};
export type TWishlist = {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
};

export type TCart = {
  id: string;
  customerId: string;
  createdAt: string;
  items: string;
};

export type TCartItem = {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  createdAt: string;
};
