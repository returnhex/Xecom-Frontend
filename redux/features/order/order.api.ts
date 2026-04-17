import { TQueryParam, TResponseRedux } from "@/types";
import { baseApi } from "@/redux/api/baseApi";
import { TCreateOrderDto, TUpdateOrderStatusDto } from "./dto/order.dto";
import { TOrder } from "@/types/order.type";

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //-----------------Get All Orders-----------------
    getAllOrders: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: "/order",
          method: "GET",
          params: params,
        }; 
      },
      providesTags: ["order"],
      transformResponse: (response: TResponseRedux<TOrder[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),

    //-----------------Get Single Order-----------------
    getSingleOrder: builder.query({
      query: (id: string) => ({
        url: `/order/${id}`,
        method: "GET",
      }),
      providesTags: ["order"],
      transformResponse: (response: TResponseRedux<TOrder>) => {
        return {
          data: response.data,
        };
      },
    }),

    //-----------------Create Order-----------------
    createOrder: builder.mutation({
      query: (data: TCreateOrderDto) => ({
        url: "/order",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["order"],
    }),

    //-----------------My Orders-----------------
    getMyOrders: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: "/order/my-orders",
          method: "GET",
          params,
        };
      },
      providesTags: ["order"],
      transformResponse: (response: TResponseRedux<TOrder[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),

    //-----------------My Single Order-----------------
    getMySingleOrder: builder.query({
      query: (id: string) => ({
        url: `/order/my-orders/${id}`,
        method: "GET",
      }),
      providesTags: ["order"],
      transformResponse: (response: TResponseRedux<TOrder>) => {
        return {
          data: response.data,
        };
      },
    }),

    //-----------------Update Order Status-----------------
    updateOrderStatus: builder.mutation({
      query: (args: { id: string; data: TUpdateOrderStatusDto }) => ({
        url: `/order/${args.id}/status`,
        method: "PUT",
        body: args.data,
      }),
      invalidatesTags: ["order"],
    }),

    //-----------------Cancel Order-----------------
    cancelOrder: builder.mutation({
      query: (id: string) => ({
        url: `/order/my-orders/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["order"],
    }),

    //-----------------Cancel Order (Admin)-----------------
    cancelOrderAdmin: builder.mutation({
      query: (args: { id: string; internalNotes?: string }) => ({
        url: `/order/${args.id}/cancel`,
        method: "PUT",
        body: { internalNotes: args.internalNotes },
      }),
      invalidatesTags: ["order"],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetSingleOrderQuery,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetMySingleOrderQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useCancelOrderAdminMutation,
} = orderApi;
