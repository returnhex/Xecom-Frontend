import { TQueryParam, TResponseRedux } from "@/types";
import { baseApi } from "@/redux/api/baseApi";
import {
  TAddCouponDto,
  TSetCouponActiveDto,
  TUpdateCouponDto,
  TValidateCouponDto,
  TValidateCouponResponse,
} from "./dto/coupon.dto";
import { TCoupon } from "@/types/marketing.type";

const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //-----------------Get All Coupons-----------------
    getAllCoupons: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: "/coupon",
          method: "GET",
          params: params,
        };
      },
      providesTags: ["coupon"],
      transformResponse: (response: TResponseRedux<TCoupon[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),

    //-----------------Get Single Coupon-----------------
    getSingleCoupon: builder.query({
      query: (id: string) => ({
        url: `/coupon/${id}`,
        method: "GET",
      }),
      providesTags: ["coupon"],
      transformResponse: (response: TResponseRedux<TCoupon>) => {
        return {
          data: response.data,
        };
      },
    }),

    //-----------------Get Coupon by Code-----------------
    getCouponByCode: builder.query({
      query: (code: string) => ({
        url: `/coupon/code/${code}`,
        method: "GET",
      }),
      providesTags: ["coupon"],
      transformResponse: (response: TResponseRedux<TCoupon>) => {
        return {
          data: response.data,
        };
      },
    }),

    //-----------------Validate Coupon (Checkout)-----------------
    validateCoupon: builder.mutation<TValidateCouponResponse, TValidateCouponDto>({
      query: (data: TValidateCouponDto) => ({
        url: "/coupon/validate",
        method: "POST",
        body: data,
      }),
    }),

    //-----------------Add Coupon-----------------
    addCoupon: builder.mutation({
      query: (data: TAddCouponDto) => ({
        url: "/coupon",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["coupon"],
    }),

    //-----------------Update Coupon-----------------
    updateCoupon: builder.mutation({
      query: (args: { id: string; data: TUpdateCouponDto }) => ({
        url: `/coupon/${args.id}`,
        method: "PUT",
        body: args.data,
      }),
      invalidatesTags: ["coupon"],
    }),

    //-----------------Activate/Deactivate Coupon-----------------
    setCouponActive: builder.mutation({
      query: (args: { id: string; data: TSetCouponActiveDto }) => ({
        url: `/coupon/${args.id}/active`,
        method: "PATCH",
        body: args.data,
      }),
      invalidatesTags: ["coupon"],
    }),

    //-----------------Delete Coupon-----------------
    deleteCoupon: builder.mutation({
      query: (id: string) => ({
        url: `/coupon/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["coupon"],
    }),
  }),
});

export const {
  useGetAllCouponsQuery,
  useGetSingleCouponQuery,
  useGetCouponByCodeQuery,
  useAddCouponMutation,
  useValidateCouponMutation,
  useUpdateCouponMutation,
  useSetCouponActiveMutation,
  useDeleteCouponMutation,
} = couponApi;
