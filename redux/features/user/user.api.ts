import { baseApi } from "@/redux/api/baseApi";
import { TAdmin, TCustomer, TQueryParam, TResponseRedux, TStaff, TUser } from "@/types";
import { TAddAddressDto, TChangeStatusDto, TUserMetadata, TUpdateUserDto } from "./dto/user.dto";

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //-----------------Get All Users-----------------
    getAllUsers: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          args.forEach((item: TQueryParam) => {
            params.append(item.name, item.value as string);
          });
        }

        return {
          url: "/user",
          method: "GET",
          params: params,
        };
      },
      providesTags: ["user"],
      transformResponse: (response: TResponseRedux<TUser[]>) => {
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    }),

    //-----------------Get Me-----------------
    getMe: builder.query({
      query: () => {
        return {
          url: "/user/me",
          method: "GET",
        };
      },
      providesTags: ["user"],
      transformResponse: (response: TResponseRedux<TAdmin | TCustomer | TStaff>) => {
        return {
          data: response.data,
        };
      },
    }),

    //-----------------Get User Metadata-----------------
    getUserMetadata: builder.query({
      query: () => {
        return {
          url: "/user/metadata",
          method: "GET",
        };
      },
      providesTags: ["user"],
      transformResponse: (response: TResponseRedux<TUserMetadata>) => {
        return {
          data: response.data,
        };
      },
    }),

    //-----------------Change Status-----------------
    // changeStatus: builder.mutation({
    //   query: (args: { id: string; data: TChangeStatusDto }) => ({
    //     url: `/user/change-status/${args.id}`,
    //     method: "POST",
    //     body: args.data,
    //   }),
    //   invalidatesTags: ["user"],
    // }),

    changeStatus: builder.mutation({
      query: (args: { id: string; data: TChangeStatusDto }) => ({
        url: `/user/change-status/${args.id}`,
        method: "PATCH",
        body: args.data,
      }),
      invalidatesTags: ["user"],
    }),

    //-----------------Add User Address-----------------
    addUserAddress: builder.mutation({
      query: (data: TAddAddressDto) => ({
        url: "/user/address",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user", "address"],
    }),

    //-----------------Update Me-----------------
    updateMe: builder.mutation<TResponseRedux<TAdmin | TCustomer | TStaff>, FormData>({
      query: (data: FormData) => ({
        url: "/user/me",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["user"],
      transformResponse: (response: TResponseRedux<TAdmin | TCustomer | TStaff>) => response,
    }),

  }),
});

export const {
  useGetAllUsersQuery,
  useGetMeQuery,
  useGetUserMetadataQuery,
  useChangeStatusMutation,
  useAddUserAddressMutation,
  useUpdateMeMutation,
} = userApi;
