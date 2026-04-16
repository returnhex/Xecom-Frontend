"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/lib/productSchema";

import Title from "@/components/sections/shared/Title";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductSummary from "./sections/ProductSummary";
import BasicInfoTab from "./sections/BasicInfoTab";
import DetailsTab from "./sections/DetailsTab";
import SpecificationsTab from "./sections/SpecificationsTab";
import MediaTab from "./sections/MediaTab";
import FaqTab from "./sections/FaqTab";
import VariantsTab from "./sections/VariantsTab";
import { useAddProductMutation, useSetProductFeaturedImageMutation } from "@/redux/features/product/product.api";
import { toast } from "sonner";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Tab config ─────
const TAB_ORDER = ["basic", "details", "specifications", "media", "faq", "variants"] as const;
type TabName = (typeof TAB_ORDER)[number];

const TAB_FIELDS: Record<TabName, string[]> = {
  basic: [
    "name",
    "slug",
    "shortDescription",
    "fullDescription",
    "brandId",
    "categoryId",
    "status",
    "featured",
    "isBestCollection",
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
  specifications: ["specifications", "relatedProductIds"],
  media: ["images"],
  faq: ["faqs"],
  variants: ["variants"],
};

// Map every field key → its tab (root key used for nested, e.g. "variants.0.sku" → "variants")
const FIELD_TO_TAB: Record<string, TabName> = {};
for (const [tab, fields] of Object.entries(TAB_FIELDS)) {
  for (const field of fields) {
    FIELD_TO_TAB[field] = tab as TabName;
  }
}

// ─── Page ───────────
export default function AddProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>("basic");
  const [imageFiles, setImageFiles] = useState<{ file: File; url: string }[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [setProductFeaturedImage] = useSetProductFeaturedImageMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  // ── Form setup ────
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      shortDescription: "",
      fullDescription: "",
      brandId: "",
      categoryId: "",
      relatedProductIds: [],
      status: "DRAFT",
      featured: false,
      isBestCollection: false,
      images: [],
      video: null,
      manualFile: null,
      weight: null,
      weightUnit: "KG",
      warranty: "",
      tags: [],
      metaKeywords: [],
      faqs: [],
      minOrderQty: 1,
      maxOrderQty: 100,
      seoTitle: "",
      seoDescription: "",
      dimensions: { unit: "CM", width: null, height: null, length: null },
      specifications: {},
      variants: [],
    },
  });

  // ── Auto-generate slug from name ────────────────────────────────────────────
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    form.setValue("slug", slug);
  };

  // ── Validate all → jump to first error field, or show summary ───────────────
  const handleSubmitWithValidation = async (status?: "DRAFT") => {
    if (status) form.setValue("status", status);

    const isValid = await form.trigger();

    if (!isValid) {
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
      return;
    }

    setShowSummary(true);
  };

  // ── Final submit (API call) ─
  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (data.images && data.images.length > 0) {
        data.images.forEach((file: File) => {
          formData.append("images", file);
        });
      }

      if (data.video) {
        formData.append("videoUrl", data.video as File);
      }

      if (data.manualFile) {
        formData.append("manualUrl", data.manualFile as File);
      }

      const payload = {
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
        faqs: data.faqs,
        minOrderQty: data.minOrderQty,
        maxOrderQty: data.maxOrderQty,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        dimension: data.dimensions,
        specifications: data.specifications,
        variants: data.variants,
        relatedProductIds: data.relatedProductIds,
      };
      formData.append("text", JSON.stringify(payload));
      console.log("Submitting form with data:", payload, "and files:", {
        images: data.images,
        video: data.video,
        manualFile: data.manualFile,
      });
      const result = await addProduct(formData).unwrap();
      console.log("API response:", result);
      
      // If new images were added, set the first image as featured
      if (result?.data?.id && data.images && data.images.length > 0) {
        try {
          const product = result.data;
          const firstImage = product.images?.[product.images.length - data.images.length];
          
          if (firstImage?.id) {
            await setProductFeaturedImage({
              productId: product.id,
              imageId: firstImage.id,
            }).unwrap();
            console.log("Featured image set successfully");
          }
        } catch (featuredError) {
          console.log("Error setting featured image:", featuredError);
          // Don't block product creation if featured image setting fails
        }
      }
      
      toast.success(result?.message || "Product created successfully 🎉");
      router.push("/admin/products/all-products");
      form.reset();
      setImageFiles([]);
      setShowSummary(false);
    } catch (error: any) {
      console.log("Full error:", JSON.stringify(error?.data, null, 2));
      const errorMessage = error?.data?.message || error?.message || "Failed to create product";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  // ── Tab navigation helpers ──
  const currentIndex = TAB_ORDER.indexOf(activeTab);
  const goNext = () => {
    if (currentIndex < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[currentIndex + 1]);
  };
  const goPrevious = () => {
    if (currentIndex > 0) setActiveTab(TAB_ORDER[currentIndex - 1]);
  };

  // ── Handle edit from summary
  const handleEditFromSummary = (tab: string) => {
    setShowSummary(false);
    setActiveTab(tab as TabName);
  };

  // ── Summary view ──
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

  // ── Main form view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title mainTitle="Add New Product" subTitle="Add another product to the inventory" />
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabName)}>
            {/* Free tab navigation */}
            <TabsList className="grid w-full grid-cols-6">
              {TAB_ORDER.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Each tab is its own component */}
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
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  disabled={isAdding}
                  onClick={() => handleSubmitWithValidation()}
                >
                  {isAdding ? "Creating..." : "Create Product"}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
