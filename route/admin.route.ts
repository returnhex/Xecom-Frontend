import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Store,
  type LucideIcon,
  MapPinIcon,
} from "lucide-react";

export interface RouteItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface RouteGroup {
  title: string;
  icon: LucideIcon;
  routes: RouteItem[];
}

export const adminRoutes: RouteGroup[] = [
  {
    title: "Products",
    icon: Package,
    routes: [
      {
        label: "All Products",
        href: "/admin/products/all-products",
      },
      {
        label: "All Reviews",
        href: "/admin/products/all-reviews",
      },
      {
        label: "Add Product",
        href: "/admin/products/add-product",
      },
      {
        label: "Categories",
        href: "/admin/products/categories",
      },
      {
        label: "Brands",
        href: "/admin/products/brands",
      },
      {
        label: "Attribute",
        href: "/admin/products/attribute",
      },
    ],
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    routes: [
      {
        label: "All Orders",
        href: "/admin/orders/all-orders",
      },
      {
        label: "Pending Orders",
        href: "/admin/orders/all-orders/pending",
      },
      {
        label: "Shipping Method",
        href: "/admin/orders/shipping-method",
      },
    ],
  },
  {
    title: "Users",
    icon: Users,
    routes: [
      {
        label: "All Users",
        href: "/admin/users/all-users",
      },
      {
        label: "Customers",
        href: "/admin/users/customers",
      },
      {
        label: "Add Admin",
        href: "/admin/users/add-admin",
      },
      {
        label: "Add Staff",
        href: "/admin/users/add-staff",
      },
    ],
  },
  {
    title: "Marketing",
    icon: ShoppingCart,
    routes: [
      {
        label: "Coupons",
        href: "/admin/marketing/coupon",
      },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    routes: [
      {
        label: "Reports",
        href: "/admin/analytics/reports",
      },
      {
        label: "Sales Analytics",
        href: "/admin/analytics/sales",
      },
    ],
  },
  {
    title: "Locations",
    icon: MapPinIcon,
    routes: [
      {
        label: "Country",
        href: "/admin/location/country",
      },
      {
        label: "Divisions",
        href: "/admin/location/division",
      },
      {
        label: "Districts",
        href: "/admin/location/district",
      },
      {
        label: "Thanas",
        href: "/admin/location/thana",
      },
    ],
  },
];

export const adminMainRoutes: RouteItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
];

export interface FooterRouteItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminFooterRoutes: FooterRouteItem[] = [
  {
    label: "View Store",
    href: "/",
    icon: Store,
  },
];
