import { TResponseRedux } from "@/types";
import { baseApi } from "@/redux/api/baseApi";
import { TCart } from "@/types/product.type";
import {
  MergeCartResponse,
  TAddToCartDto,
  TAddToGuestCartDto,
  TMergeGuestCartDto,
  TUpdateCartQuantityDto,
} from "./dto/cart.dto";

const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //-----------------Get My Cart-----------------
    getMyCart: builder.query({
      query: () => ({
        url: "/cart",
        method: "GET",
      }),
      providesTags: ["cart"],
      transformResponse: (response: TResponseRedux<TCart>) => {
        return {
          data: response.data,
        };
      },
    }),

    //-----------------Add to Cart-----------------
    addToCart: builder.mutation({
      query: (data: TAddToCartDto) => ({
        url: "/cart",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["cart"],
    }),

    //-----------------Update Cart Quantity-----------------
    updateCartQuantity: builder.mutation({
      query: (args: { id: string; data: TUpdateCartQuantityDto }) => ({
        url: `/cart/${args.id}`,
        method: "PUT",
        body: args.data,
      }),
      invalidatesTags: ["cart"],
    }),

    //-----------------Delete Cart Item-----------------
    deleteCartItem: builder.mutation({
      query: (id: string) => ({
        url: `/cart/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["cart"],
    }),

    //-----------------Create Guest Token-----------------
    createGuestToken: builder.mutation({
      query: () => ({
        url: "/cart/guest/token",
        method: "POST",
      }),
      transformResponse: (response: TResponseRedux<{ guestToken: string }>) => {
        return response.data;
      },
    }),

    //-----------------Get Guest Cart-----------------
    getGuestCart: builder.query({
      query: (guestToken: string) => ({
        url: `/cart/guest/${guestToken}`,
        method: "GET",
      }),
      providesTags: ["cart"],
      transformResponse: (response: TResponseRedux<TCart>) => {
        return {
          data: response.data,
        };
      },
    }),

    //-----------------Add to Guest Cart-----------------
    addToGuestCart: builder.mutation({
      query: (data: TAddToGuestCartDto) => ({
        url: "/cart/guest",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["cart"],
    }),

    //-----------------Update Guest Cart Quantity-----------------
    updateGuestCartQuantity: builder.mutation({
      query: (args: { guestToken: string; id: string; data: TUpdateCartQuantityDto }) => ({
        url: `/cart/guest/${args.guestToken}/items/${args.id}`,
        method: "PUT",
        body: args.data,
      }),
      invalidatesTags: ["cart"],
    }),

    //-----------------Delete Guest Cart Item-----------------
    deleteGuestCartItem: builder.mutation({
      query: (args: { guestToken: string; id: string }) => ({
        url: `/cart/guest/${args.guestToken}/items/${args.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["cart"],
    }),

    //-----------------Merge Guest Cart-----------------
    mergeGuestCart: builder.mutation<MergeCartResponse, TMergeGuestCartDto>({
      query: (data: TMergeGuestCartDto) => ({
        url: "/cart/merge",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["cart"],
    }),
  }),
});

export const {
  useGetMyCartQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useDeleteCartItemMutation,
  useCreateGuestTokenMutation,
  useGetGuestCartQuery,
  useAddToGuestCartMutation,
  useUpdateGuestCartQuantityMutation,
  useDeleteGuestCartItemMutation,
  useMergeGuestCartMutation,
} = cartApi;
