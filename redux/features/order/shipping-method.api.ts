import { TQueryParam, TResponseRedux } from "@/types";
import { baseApi } from "@/redux/api/baseApi";
import { TShippingMethod } from "@/types/order.type";
import { TCreateShippingMethodDto, TUpdateShippingMethodDto } from "./dto/shipping-method.dto";

const shippingMethodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //-----------------Get All Shipping Methods-----------------
    getAllShippingMethods: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: "/shipping-method",
          method: "GET",
          params: params,
        };
      },
      providesTags: ["shippingMethod"],
      transformResponse: (response: TResponseRedux<TShippingMethod[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
    }),

    //-----------------Get Single Shipping Method-----------------
    getSingleShippingMethod: builder.query({
      query: (id: string) => ({
        url: `/shipping-method/${id}`,
        method: "GET",
      }),
      providesTags: ["shippingMethod"],
      transformResponse: (response: TResponseRedux<TShippingMethod>) => ({
        data: response.data,
      }),
    }),

    //-----------------Add Shipping Method-----------------
    addShippingMethod: builder.mutation({
      query: (data: TCreateShippingMethodDto) => ({
        url: "/shipping-method",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["shippingMethod"],
    }),

    //-----------------Update Shipping Method-----------------
    updateShippingMethod: builder.mutation({
      query: (args: { id: string; data: TUpdateShippingMethodDto }) => ({
        url: `/shipping-method/${args.id}`,
        method: "PUT",
        body: args.data,
      }),
      invalidatesTags: ["shippingMethod"],
    }),

    //-----------------Delete Shipping Method-----------------
    deleteShippingMethod: builder.mutation({
      query: (id: string) => ({
        url: `/shipping-method/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["shippingMethod"],
    }),
  }),
});

export const {
  useGetAllShippingMethodsQuery,
  useGetSingleShippingMethodQuery,
  useAddShippingMethodMutation,
  useUpdateShippingMethodMutation,
  useDeleteShippingMethodMutation,
} = shippingMethodApi;
