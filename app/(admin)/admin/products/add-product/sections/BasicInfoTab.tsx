"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProductFormData } from "@/lib/productSchema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { API_URL } from "@/redux/api/baseApi";

interface BasicInfoTabProps {
  form: UseFormReturn<ProductFormData>;
  fieldRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onNameChange: (name: string) => void;
}

export default function BasicInfoTab({ form, fieldRefs, onNameChange }: BasicInfoTabProps) {
  const [selectedBrand, setSelectedBrand] = useState<SelectOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);
  return (
    <TabsContent value="basic" className="space-y-4">
      <Card className="rounded-lg pt-0 pb-4 lg:pb-6">
        <CardHeader className="bg-success text-success-foreground rounded-t-lg px-4 py-4 lg:px-6">
          <div className="mt-2 flex items-center gap-2 text-xl">
            <div className="bg-primary h-5 w-1 rounded-full"></div>
            <CardTitle className="font-semibold">Basic Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 lg:px-6">
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input
                      ref={(el) => {
                        fieldRefs.current["name"] = el;
                      }}
                      placeholder="Name of the Product"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onNameChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-danger" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input
                      ref={(el) => {
                        fieldRefs.current["slug"] = el;
                      }}
                      placeholder="name-of-the-product"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-danger" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand *</FormLabel>
                  <FormControl>
                    <div
                      ref={(el) => {
                        fieldRefs.current["brandId"] = el;
                      }}
                    >
                      <CustomSelect
                        endpoint={`${API_URL}/brand`}
                        fields={["name", "id"]}
                        mapToOption={(item) => ({
                          value: item.id,
                          label: item.name,
                        })}
                        value={selectedBrand}
                        onChange={(val) => {
                          const option = val as SelectOption | null;
                          setSelectedBrand(option);
                          field.onChange(option ? option.value : "");
                        }}
                        searchable
                        paginated
                        placeholder="Select a brand"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-danger" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <div
                      ref={(el) => {
                        fieldRefs.current["categoryId"] = el;
                      }}
                    >
                      <CustomSelect
                        endpoint={`${API_URL}/category`}
                        fields={["name", "id"]}
                        mapToOption={(item) => ({
                          value: item.id,
                          label: item.name,
                        })}
                        value={selectedCategory}
                        onChange={(val) => {
                          const option = val as SelectOption | null;
                          setSelectedCategory(option);
                          field.onChange(option ? option.value : "");
                        }}
                        searchable
                        paginated
                        placeholder="Select a category"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-danger" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      ref={(el) => {
                        fieldRefs.current["shortDescription"] = el;
                      }}
                      placeholder="Brief summary of the product."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-danger" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      ref={(el) => {
                        fieldRefs.current["fullDescription"] = el;
                      }}
                      placeholder="Detailed description of the product."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-danger" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                      <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-danger" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="mt-4 flex flex-row items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Featured Product?</FormLabel>
                    <FormDescription>Display this product as featured</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
