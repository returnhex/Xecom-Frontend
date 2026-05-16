"use client";

import { ProductFormData } from "@/lib/productSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import Title from "@/components/sections/shared/Title";
import Image from "next/image";
import { useGetSingleBrandQuery } from "@/redux/features/product/brand.api";
import { useGetSingleCategoryQuery } from "@/redux/features/product/category.api";
import { useGetAllProductsQuery } from "@/redux/features/product/product.api";

interface ProductSummaryProps {
  data: ProductFormData;
  imageFiles: { file: File; url: string }[];
  onEdit: (tab: string) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const BRAND_MAP: Record<string, string> = {
  "3912d37f-50e6-4160-a412-3f7dd86c3b7b": "Nike",
  "brand-2": "Adidas",
  "brand-3": "Puma",
};
const CATEGORY_MAP: Record<string, string> = {
  "9bd04cc8-354a-4c6d-8d44-dd1d9a720eba": "Men's Shoe",
  "category-2": "Women's Shoe",
  "category-3": "Kids Shoe",
};

function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={mono ? "text-right font-mono text-xs break-all" : "text-right font-medium"}>
        {value}
      </span>
    </div>
  );
}

function SummaryCard({
  title,
  tab,
  onEdit,
  children,
}: {
  title: string;
  tab: string;
  onEdit: (tab: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="bg-muted/30 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-5 w-1 rounded-full" />
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onEdit(tab)}>
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-4 text-sm">{children}</CardContent>
    </Card>
  );
}

export default function ProductSummary({
  data,
  imageFiles,
  onEdit,
  onConfirm,
  isSubmitting,
}: ProductSummaryProps) {
  const { data: BrandData } = useGetSingleBrandQuery(data.brandId);
  const { data: categoryData } = useGetSingleCategoryQuery(data.categoryId);
  const { data: allProductsData } = useGetAllProductsQuery([]);

  const brandName = BrandData?.data.name || data.brandId;
  const categoryName = categoryData?.data.name || data.categoryId;

  // Get all products and filter by relatedProductIds
  const allProducts = allProductsData?.data || [];
  const relatedProducts = allProducts.filter((product: any) =>
    data.relatedProductIds?.includes(product.id)
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title mainTitle="Product Summary" />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onEdit("basic")}>
            ← Edit
          </Button>
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm & Create
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Basic */}
        <SummaryCard title="Basic Information" tab="basic" onEdit={onEdit}>
          <SummaryRow label="Name" value={data.name} />
          <SummaryRow label="Slug" value={data.slug} mono />
          <SummaryRow label="Brand" value={brandName} />
          <SummaryRow label="Category" value={categoryName} />
          <SummaryRow label="Status" value={<Badge variant="outline">{data.status}</Badge>} />
          <SummaryRow label="Featured" value={data.featured ? "Yes" : "No"} />
          <SummaryRow label="BestCollection" value={data.isBestCollection ? "Yes" : "No"} />
          <SummaryRow label="Short Description" value={data.shortDescription} />
        </SummaryCard>

        {/* Details */}
        <SummaryCard title="Product Details" tab="details" onEdit={onEdit}>
          <SummaryRow label="Weight" value={`${data.weight} ${data.weightUnit}`} />
          <SummaryRow label="Warranty" value={data.warranty} />
          <SummaryRow label="Min Qty" value={String(data.minOrderQty)} />
          <SummaryRow label="Max Qty" value={String(data.maxOrderQty)} />
          <SummaryRow
            label="Dimensions"
            value={`${data.dimensions.length} × ${data.dimensions.width} × ${data.dimensions.height} ${data.dimensions.unit}`}
          />
          {data.tags.length > 0 && (
            <div>
              <span className="text-muted-foreground text-xs">Tags</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {data.tags.map((t, i) => (
                  <Badge key={i} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </SummaryCard>

        {/* Specifications */}
        <SummaryCard title="Specifications" tab="specifications" onEdit={onEdit}>
          {Object.entries(data.specifications).length === 0 ? (
            <p className="text-muted-foreground">No specifications added.</p>
          ) : (
            Object.entries(data.specifications).map(([k, v]) =>
              v ? <SummaryRow key={k} label={k} value={v} /> : null
            )
          )}

          {/* Related Products Section */}
          {data.relatedProductIds && data.relatedProductIds.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <p className="text-muted-foreground mb-3 text-xs font-semibold">
                Related Products ({relatedProducts.length})
              </p>
              <div className="flex flex-wrap gap-3">
                {relatedProducts.map((product: any) => {
                  const productImage =
                    product.images && product.images.length > 0 ? product.images[0].imageUrl : null;
                  return (
                    <div key={product.id} className="flex flex-col items-center gap-2">
                      {productImage ? (
                        <Image
                          width={80}
                          height={80}
                          src={productImage}
                          alt={product.name}
                          className="h-20 w-20 rounded-lg border object-cover"
                        />
                      ) : (
                        <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-lg border">
                          <span className="text-muted-foreground text-xs">No image</span>
                        </div>
                      )}
                      <span className="line-clamp-2 max-w-20 text-center text-xs font-medium">
                        {product.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SummaryCard>

        {/* SEO */}
        <SummaryCard title="SEO Settings" tab="details" onEdit={onEdit}>
          <SummaryRow label="SEO Title" value={data.seoTitle} />
          <SummaryRow label="SEO Description" value={data.seoDescription} />
          {data.metaKeywords.length > 0 && (
            <div>
              <span className="text-muted-foreground text-xs">Keywords</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {data.metaKeywords.map((k, i) => (
                  <Badge key={i} variant="secondary">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </SummaryCard>

        {/* Media */}
        <SummaryCard title="Media" tab="media" onEdit={onEdit}>
          <SummaryRow label="Images" value={`${data.images.length} file(s) uploaded`} />
          {data.video && <SummaryRow label="Video" value={data.video.name} />}
          {data.manualFile && <SummaryRow label="Manual" value={data.manualFile.name} />}
          {imageFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {imageFiles.map((img, i) => (
                <Image
                  width={200}
                  height={200}
                  key={i}
                  src={img.url}
                  alt=""
                  className="h-14 w-14 rounded-lg border object-cover"
                />
              ))}
            </div>
          )}
        </SummaryCard>

        {/* FAQ */}
        <SummaryCard title="FAQs" tab="faq" onEdit={onEdit}>
          {data.faqs.length === 0 ? (
            <p className="text-muted-foreground">No FAQs added.</p>
          ) : (
            data.faqs.map((faq, i) => (
              <div key={i} className="space-y-1 rounded-lg border p-3">
                <p className="font-medium">
                  Q{i + 1}: {faq.question}
                </p>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))
          )}
        </SummaryCard>

        {/* Variants */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-muted/30 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary h-5 w-1 rounded-full" />
                <CardTitle className="text-base font-semibold">
                  Variants ({data.variants.length})
                </CardTitle>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onEdit("variants")}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            {data.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-lg border p-3 md:grid-cols-4">
                <SummaryRow label="SKU" value={v.sku} mono />
                <SummaryRow label="Price" value={`$${v.price}`} />
                <SummaryRow label="Cost" value={`$${v.cost}`} />
                <SummaryRow label="Stock" value={String(v.stockQuantity)} />
                <SummaryRow label="Alert At" value={String(v.stockAlertThreshold)} />
                <SummaryRow label="Default" value={v.isDefault ? "Yes" : "No"} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Full Description */}
      {data.fullDescription && (
        <Card>
          <CardHeader className="bg-muted/30 border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary h-5 w-1 rounded-full" />
              <CardTitle className="text-base font-semibold">Full Description</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground pt-4 text-sm leading-relaxed">
            {data.fullDescription}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
