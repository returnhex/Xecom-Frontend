"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Title from "@/components/sections/shared/Title";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetSingleProductQuery,
  useUpdateProductMutation,
  useSetProductFeaturedImageMutation,
} from "@/redux/features/product/product.api";
import { toast } from "sonner";
import { ArrowBigLeft, ArrowBigRight, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ProductSummary from "../../../add-product/sections/ProductSummary";
import BasicInfoTab from "../../../add-product/sections/BasicInfoTab";
import DetailsTab from "../../../add-product/sections/DetailsTab";
import SpecificationsTab from "../../../add-product/sections/SpecificationsTab";
import MediaTab from "../../../add-product/sections/MediaTab";
import FaqTab from "../../../add-product/sections/FaqTab";
import VariantsTab from "../../../add-product/sections/VariantsTab";
import { editProductSchema } from "@/lib/editproduct.schema";
import type { ProductFormData } from "@/lib/productSchema";

// ─── Tab config ─────────────────────────────────────────────────────────────
const TAB_ORDER = ["basic", "details", "specifications", "media", "faq", "variants"] as const;
type TabName = (typeof TAB_ORDER)[number];
type EditableProductStatus = ProductFormData["status"];

const TAB_FIELDS: Record<TabName, string[]> = {
  basic: [
    "name",
    "slug",
    "shortDescription",
    "fullDescription",
    "brandId",
    "isBestCollection",
    "categoryId",
    "status",
    "featured",
  ],
  details: [
    "weight",
    "weightUnit",
    "warranty",
    "dimensions.width",
    "dimensions.height",
    "dimensions.length",
    "dimensions.unit",
    "tags",
    "minOrderQty",
    "maxOrderQty",
    "seoTitle",
    "seoDescription",
    "metaKeywords",
  ],
  specifications: ["specifications"],
  media: ["images"],
  faq: ["faqs"],
  variants: ["variants"],
};

const FIELD_TO_TAB: Record<string, TabName> = {};
for (const [tab, fields] of Object.entries(TAB_FIELDS)) {
  for (const field of fields) {
    FIELD_TO_TAB[field] = tab as TabName;
  }
}

const EDITABLE_PRODUCT_STATUSES: ReadonlySet<EditableProductStatus> = new Set([
  "ACTIVE",
  "INACTIVE",
  "DRAFT",
]);

const normalizeProductStatus = (status?: string | null): EditableProductStatus => {
  if (status && EDITABLE_PRODUCT_STATUSES.has(status as EditableProductStatus)) {
    return status as EditableProductStatus;
  }
  return "INACTIVE";
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabName>("basic");
  const [imageFiles, setImageFiles] = useState<{ file: File; url: string }[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  // ── Fetch existing product ────────────────────────────────────────────────
  const { data: productData, isLoading: isProductLoading } = useGetSingleProductQuery(productId, {
    skip: !productId,
  });

  const [updateProduct] = useUpdateProductMutation();
  const [setProductFeaturedImage] = useSetProductFeaturedImageMutation();

  // ── Form setup ────────────────────────────────────────────────────────────
  const form = useForm<ProductFormData>({
    resolver: zodResolver(editProductSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      shortDescription: "",
      fullDescription: "",
      brandId: "",
      categoryId: "",
      status: "DRAFT",
      featured: false,
      images: [],
      video: null,
      manualFile: null,
      weight: undefined,
      weightUnit: "KG",
      warranty: "",
      tags: [],
      metaKeywords: [],
      faqs: [],
      minOrderQty: 1,
      maxOrderQty: 100,
      seoTitle: "",
      seoDescription: "",
      dimensions: { unit: "CM", width: undefined, height: undefined, length: undefined },
      specifications: {},
      variants: [],
    },
  });

  // ── Populate form once product is fetched ─────────────────────────────────
  useEffect(() => {
    const product = productData?.data;
    if (!product) return;

    form.reset({
      name: product.name ?? "",
      slug: product.slug ?? "",
      shortDescription: product.shortDescription ?? "",
      fullDescription: product.fullDescription ?? "",
      brandId: product.brandId ?? "",
      categoryId: product.categoryId ?? "",
      status: normalizeProductStatus(product.status),
      featured: product.featured ?? false,
      isBestCollection: product.isBestCollection ?? false,
      // Images: keep existing URLs in a separate state; form gets empty array
      // (new files the user picks will be appended in onSubmit)
      images: [],
      video: null,
      manualFile: null,
      weight: toOptionalNumber(product.weight),
      weightUnit: product.weightUnit ?? "KG",
      warranty: product.warranty ?? "",
      tags: product.tags ?? [],
      metaKeywords: product.metaKeywords ?? [],
      faqs: product.faqs ?? [],
      minOrderQty: product.minOrderQty ?? 1,
      maxOrderQty: product.maxOrderQty ?? 100,
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
      dimensions: {
        unit: product.dimension?.unit ?? "CM",
        width: toOptionalNumber(product.dimension?.width),
        height: toOptionalNumber(product.dimension?.height),
        length: toOptionalNumber(product.dimension?.length),
      },
      specifications: product.specifications ?? {},
      variants:
        product.variants?.map((v: any) => ({
          ...v,
          price: Number(v.price),
          cost: Number(v.cost),
          stockQuantity: Number(v.stockQuantity),
          stockAlertThreshold: Number(v.stockAlertThreshold),
        })) ?? [],
    });

    // Pre-populate existing images as preview (url only, no File object)
    if (product.images && product.images.length > 0) {
      const existing = product.images.map((img: { imageUrl: string }) => ({
        file: null as unknown as File, // sentinel – existing server image
        url: img.imageUrl,
      }));
      setImageFiles(existing);
    }
  }, [productData]);

  // ── Auto-generate slug from name ──────────────────────────────────────────
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    form.setValue("slug", slug);
  };

  // ── Helper: jump to the tab/field of the first error ─────────────────────
  const jumpToFirstError = () => {
    const errors = form.formState.errors;
    const flatKeys: string[] = [];

    const flatten = (obj: any, prefix = "") => {
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (obj[key]?.message || obj[key]?.type) {
          flatKeys.push(fullKey);
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          flatten(obj[key], fullKey);
        }
      }
    };
    flatten(errors);

    if (flatKeys.length > 0) {
      const firstKey = flatKeys[0];
      const rootKey = firstKey.split(".")[0];
      const targetTab = FIELD_TO_TAB[rootKey] || FIELD_TO_TAB[firstKey] || "basic";
      setActiveTab(targetTab);
      setTimeout(() => {
        const el = fieldRefs.current[firstKey] || fieldRefs.current[rootKey];
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus?.();
      }, 120);
    }
  };

  // ── Validate → jump to first error, or show summary ───────────────────────
  const handleSubmitWithValidation = async (status?: "DRAFT") => {
    if (status) form.setValue("status", status);

    // Pass 1: base schema — type errors, format issues
    const isValid = await form.trigger();
    if (!isValid) {
      jumpToFirstError();
      return;
    }

    // Pass 2: strict submit rules — images, variants, tags, faqs, SEO
    const submitResult = editProductSchema.safeParse(form.getValues());
    if (!submitResult.success) {
      // Push errors into RHF so they render in the UI
      submitResult.error.issues.forEach((issue) => {
        const fieldPath = issue.path.join(".") as any;
        form.setError(fieldPath, { type: "manual", message: issue.message });
      });

      // Jump to the tab of the first error
      const firstPath = submitResult.error.issues[0]?.path?.[0]?.toString() ?? "";
      const targetTab = FIELD_TO_TAB[firstPath] || "basic";
      setActiveTab(targetTab);
      setTimeout(() => {
        const el = fieldRefs.current[firstPath];
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus?.();
      }, 120);
      return;
    }

    setShowSummary(true);
  };

  // ── Final submit (PATCH) ──────────────────────────────────────────────────
  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      const newFiles = imageFiles.filter((img) => img.file instanceof File);
      newFiles.forEach(({ file }) => formData.append("images", file));

      if (data.video) formData.append("videoUrl", data.video as File);
      if (data.manualFile) formData.append("manualUrl", data.manualFile as File);

      const payload = {
        id: productId,
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        brandId: data.brandId,
        categoryId: data.categoryId,
        status: data.status,
        featured: data.featured,
        isBestCollection: data.isBestCollection,
        weight: data.weight,
        weightUnit: data.weightUnit,
        warranty: data.warranty,
        tags: data.tags,
        metaKeywords: data.metaKeywords,
        relatedProductIds: data.relatedProductIds,
        faqs: data.faqs,
        minOrderQty: data.minOrderQty,
        maxOrderQty: data.maxOrderQty,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        dimension: data.dimensions,
        specifications: data.specifications,
        variants: data.variants,
        existingImages: imageFiles
          .filter((img) => !(img.file instanceof File))
          .map((img) => img.url),
      };

      formData.append("text", JSON.stringify(payload));

      const result = await updateProduct({ id: productId, data: formData }).unwrap();

      if (result?.data?.id && newFiles.length > 0) {
        try {
          const product = result.data;
          const existingCount = imageFiles.filter((img) => !(img.file instanceof File)).length;
          const firstNewImage = product.images?.[existingCount];
          if (firstNewImage?.id) {
            await setProductFeaturedImage({
              productId: product.id,
              imageId: firstNewImage.id,
            }).unwrap();
          }
        } catch (featuredError) {
          console.log("Error setting featured image:", featuredError);
        }
      }

      toast.success(result?.message || "Product updated successfully ✅");
      router.push("/admin/products/all-products");
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to update product";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Tab navigation ────────────────────────────────────────────────────────
  const currentIndex = TAB_ORDER.indexOf(activeTab);
  const goNext = () => {
    if (currentIndex < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[currentIndex + 1]);
  };
  const goPrevious = () => {
    if (currentIndex > 0) setActiveTab(TAB_ORDER[currentIndex - 1]);
  };

  const handleEditFromSummary = (tab: string) => {
    setShowSummary(false);
    setActiveTab(tab as TabName);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isProductLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="text-muted-foreground ml-3 text-sm">Loading product...</span>
      </div>
    );
  }

  // ── Summary view ──────────────────────────────────────────────────────────
  if (showSummary) {
    return (
      <ProductSummary
        data={form.getValues()}
        imageFiles={imageFiles}
        onEdit={handleEditFromSummary}
        onConfirm={() => form.handleSubmit(onSubmit)()}
        isSubmitting={isSubmitting}
      />
    );
  }

  // ── Main form view ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title mainTitle="Edit Product" subTitle={`Editing: ${productData?.data?.name ?? "..."}`} />
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabName)}>
            <TabsList className="grid w-full grid-cols-6">
              {TAB_ORDER.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <BasicInfoTab form={form} fieldRefs={fieldRefs} onNameChange={handleNameChange} />
            <DetailsTab form={form} />
            <SpecificationsTab form={form} />
            <MediaTab
              form={form}
              fieldRefs={fieldRefs}
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
            />
            <FaqTab form={form} />
            <VariantsTab form={form} fieldRefs={fieldRefs} />
          </Tabs>

          {/* Navigation buttons */}
          <div className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={currentIndex === 0}
              onClick={goPrevious}
            >
              <ArrowBigLeft /> Previous
            </Button>

            {currentIndex < TAB_ORDER.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Next <ArrowBigRight />
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmitWithValidation("DRAFT")}
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitWithValidation()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Update Product"
                  )}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
