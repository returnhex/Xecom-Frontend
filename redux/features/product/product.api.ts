import { TQueryParam, TResponseRedux } from "@/types";
import { baseApi } from "@/redux/api/baseApi";
import { TProduct } from "@/types/product.type";
import { TProductMetadata } from "./dto/product.dto";

const toNumberOr = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeProduct = (product: TProduct): TProduct => ({
  ...product,
  avgRating:
    product.avgRating === null || product.avgRating === undefined
      ? null
      : toNumberOr(product.avgRating, 0),
  reviewCount: toNumberOr(product.reviewCount, 0),
  totalSales: toNumberOr(product.totalSales, 0),
  viewCount: toNumberOr(product.viewCount, 0),
});

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //-----------------Get All Products-----------------
    getAllProducts: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: "/product",
          method: "GET",
          params: params,
        };
      },
      providesTags: ["product"],
      transformResponse: (response: TResponseRedux<TProduct[]>) => {
        return {
          data: response.data.map(normalizeProduct),
          meta: response.meta,
        };
      },
    }),

    //-----------------Get Single Product-----------------
    getSingleProduct: builder.query({
      query: (id: string) => ({
        url: `/product/${id}`,
        method: "GET",
      }),
      providesTags: ["product"],
      transformResponse: (response: TResponseRedux<TProduct>) => {
        return {
          data: normalizeProduct(response.data),
        };
      },
    }),

    //-----------------Add Product-----------------
    addProduct: builder.mutation({
      query: (data: FormData) => ({
        url: "/product",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),

    // product.api.ts

    updateProductStatus: builder.mutation({
      query: (args: { id: string; status: string }) => ({
        url: `/product/${args.id}/status`,
        method: "PATCH",
        body: { status: args.status },
      }),
      invalidatesTags: ["product"],
    }),

    updateProductFeatured: builder.mutation({
      query: (args: { id: string; featured: boolean }) => ({
        url: `/product/${args.id}/featured`,
        method: "PATCH",
        body: { featured: args.featured },
      }),
      invalidatesTags: ["product"],
    }),

    updateProduct: builder.mutation({
      query: (args: { id: string; data: FormData | Record<string, unknown> }) => ({
        url: `/product/${args.id}`,
        method: "PUT",
        body: args.data,
      }),
    }),
    // -------------product Metadata............
    getProductMetadata: builder.query({
      query: () => ({
        url: "/product/metadata",
        method: "GET",
      }),
      providesTags: ["product"],
      transformResponse: (response: TResponseRedux<TProductMetadata>) => {
        return {
          data: response.data,
        };
      },
    }),

    //-----------------Delete Product-----------------
    deleteProduct: builder.mutation({
      query: (id: string) => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["product"],
    }),

    //-----------------Set Featured Image-----------------
    setProductFeaturedImage: builder.mutation({
      query: (args: { productId: string; imageId: string }) => ({
        url: `/product/${args.productId}/featured-image/${args.imageId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["product"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useGetProductMetadataQuery,
  useDeleteProductMutation,
  useUpdateProductStatusMutation,
  useUpdateProductFeaturedMutation,
  useSetProductFeaturedImageMutation,
} = productApi;
