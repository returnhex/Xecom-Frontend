import { RootState } from "@/redux/store";
import {
  BaseQueryApi,
  BaseQueryFn,
  DefinitionType,
  FetchArgs,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { logout, setUser } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";

// export const API_URL = "http://localhost:5002";
export const API_URL = "https://xecom-backend.onrender.com";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", token);
    }
    return headers;
  },
});

// We use this extra layer over baseQuery to authenticate user with refresh token
const baseQueryWithRefreshToken: BaseQueryFn<FetchArgs, BaseQueryApi, DefinitionType> = async (
  args,
  api,
  extraOptions
): Promise<any> => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 404) {
    toast.error((result.error.data as { message: string }).message);
  }

  if (result?.error?.status === 403) {
    toast.error((result.error.data as { message: string }).message);
  }

  if (result?.error?.status === 401) {
    //* Send Refresh
    console.log("Sending refresh token");

    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();
    console.log(data);

    if (data?.data?.accessToken) {
      const user = (api.getState() as RootState).auth.user;

      api.dispatch(
        setUser({
          user,
          token: data?.data?.accessToken,
        })
      );

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [
    "user",
    "admin",
    "staff",
    "customer",
    "address",
    "country",
    "division",
    "district",
    "thana",
    "category",
    "brand",
    "product",
    "attribute",
    "attributeValue",
    "productVariant",
    "wishlist",
    "review",
    "cart",
    "order",
    "coupon",
    "notification",
    "setting",
    "tenant",
    "subscription",
  ],
  endpoints: () => ({}),
});
