"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  ShoppingCart,
  Navigation,
  LogIn,
  LogOut,
  LayoutDashboard,
  User,
  Package,
  Heart,
  MessageCircle,
  Lock,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { mainRoutes } from "@/route/main.route";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCurrentUser, logout } from "@/redux/features/auth/authSlice";
import { useGetMeQuery } from "@/redux/features/user/user.api";
import { UserRole } from "@/redux/features/auth/dto/auth.dto";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CartSheet from "@/components/sections/shared/CartSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { TargetAudience } from "@/constants/enum";
import { useGetAllCategoriesQuery } from "@/redux/features/product/category.api";
import { useGetMyCartQuery } from "@/redux/features/order/cart.api";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { data: cartData } = useGetMyCartQuery([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Auth state
  const user = useAppSelector(selectCurrentUser);
  const { data: userData } = useGetMeQuery(undefined, {
    skip: !user,
  });

  // Get user initials from name
  const getUserInitials = (name: string): string => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || "")).toUpperCase();
  };

  // Get dashboard route based on user role
  const getDashboardRoute = (): string => {
    if (!user) return "/";
    if (
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.ADMIN ||
      user.role === UserRole.STAFF
    ) {
      return "/admin";
    }
    return "/";
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/login");
  };
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  //  Add inside Navbar component body
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery([]);

  const getCategoriesForAudience = (audience: TargetAudience) => {
    if (!categoriesData?.data) return [];
    return categoriesData.data.filter((cat: any) => {
      const t = cat.targetAudience;
      if (!t) return false;
      if (Array.isArray(t)) {
        return t.some((v: string) => v?.toString().toUpperCase() === audience.toUpperCase());
      }
      return t.toString().toUpperCase() === audience.toUpperCase();
    });
  };

  const AUDIENCE_LABELS: Record<TargetAudience, string> = {
    [TargetAudience.MEN]: "Men",
    [TargetAudience.WOMEN]: "Women",
    [TargetAudience.KIDS]: "Children",
  };

  return (
    <div className="bg-secondary w-full">
      {/* Top Bar */}
      <div
        className={`bg-primary container mx-auto hidden py-2! text-sm text-white transition-all duration-300 ease-in-out lg:flex ${
          isSticky ? "h-0 overflow-hidden opacity-0" : "h-auto overflow-visible py-2! opacity-100"
        }`}
      >
        <div className="flex w-1/2 items-center justify-between">
          <p className="flex items-center gap-2">
            <span className="flex gap-1 font-semibold">
              <Navigation size={20} /> 7 Days A Week
            </span>
            <span>From 9:00 AM To 7:00 PM</span>
          </p>
        </div>

        <div className="flex w-1/2 items-center justify-end gap-6">
          <a
            href="tel:+8801902042884"
            className="flex items-center gap-2 text-sm transition-colors hover:text-white/80"
          >
            Call Us: <span className="font-semibold">+88019020-42884</span>
          </a>

          <div className="flex items-center gap-4 border-l border-white/20 pl-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors hover:text-white/80"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-white/80"
                >
                  <span>Login</span>
                </Link>
                <span>/</span>
                <Link
                  href="/register"
                  className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-white/80"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {isSticky && <div className="h-15" />}
      <nav
        className={`bg-secondary left-0 w-full transition-all duration-300 ease-in-out ${
          isSticky ? "fixed top-0 z-40 py-3 shadow-md" : "relative py-3 shadow-sm"
        }`}
      >
        <div className={`container mx-auto flex items-center justify-between py-0! md:px-4`}>
          <div className="flex items-center justify-center gap-20">
            <div className="merriweather-font text-3xl font-extrabold tracking-widest">STEPS</div>

            <div className="hidden items-start justify-start gap-6 lg:flex">
              {mainRoutes.map((route) => {
                const isActive =
                  pathname === route.href ||
                  (route.href !== "/" && pathname.startsWith(route.href));

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`relative text-sm font-thin transition-colors ${
                      isActive
                        ? "text-primary after:bg-primary font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full dark:text-white dark:after:bg-white"
                        : "text-foreground hover:text-foreground"
                    }`}
                  >
                    {route.label}
                  </Link>
                );
              })}
              <NavigationMenu>
                <NavigationMenuList className="-mt-0.5 hidden gap-6 lg:flex">
                  {Object.values(TargetAudience).map((audience) => {
                    const cats = getCategoriesForAudience(audience);
                    return (
                      <NavigationMenuItem key={audience}>
                        <NavigationMenuTrigger className="font-thin">
                          {AUDIENCE_LABELS[audience]}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-48">
                            {/* All link */}
                            <Link
                              href={`/products?categories=${getCategoriesForAudience(audience)
                                .map((cat: any) => cat._id ?? cat.id)
                                .join(",")}`}
                              className="hover:bg-muted block rounded-md px-3 py-2 text-sm font-medium transition-colors"
                            >
                              All
                            </Link>

                            {/* Loading skeleton */}
                            {isCategoriesLoading ? (
                              <>
                                <li className="px-3 py-2">
                                  <Skeleton className="h-4 w-28" />
                                </li>
                                <li className="px-3 py-2">
                                  <Skeleton className="h-4 w-24" />
                                </li>
                                <li className="px-3 py-2">
                                  <Skeleton className="h-4 w-20" />
                                </li>
                              </>
                            ) : cats.length > 0 ? (
                              cats.map((cat: any) => (
                                <li key={cat._id ?? cat.id}>
                                  <Link
                                    href={`/products?categories=${cat._id ?? cat.id}`}
                                    className="hover:bg-muted block rounded-md px-3 py-2 text-sm transition-colors"
                                  >
                                    {cat.name}
                                  </Link>
                                </li>
                              ))
                            ) : (
                              <li className="text-muted-foreground px-3 py-2 text-xs">
                                No categories
                              </li>
                            )}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <div className="nav-bg-base hidden items-center justify-between gap-6 rounded-lg text-sm lg:flex">
            <div className="relative flex flex-1 items-center"></div>

            <TooltipProvider>
              <div className="flex items-center gap-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex cursor-pointer gap-1" onClick={() => setCartOpen(true)}>
                      <ShoppingCart /> ({cartData?.data?.items?.length ?? 0})
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cart</p>
                  </TooltipContent>
                </Tooltip>
                <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
                {user && userData?.data && (
                  <>
                    <HoverCard openDelay={200} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div className="cursor-pointer">
                          <Avatar className="h-8 w-8">
                            {userData.data.user.profilePicture && (
                              <AvatarImage
                                src={userData.data.user.profilePicture}
                                alt={userData.data.user.name}
                              />
                            )}
                            <AvatarFallback className="text-xs">
                              {getUserInitials(userData.data.user.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </HoverCardTrigger>

                      <HoverCardContent className="w-56 p-2" align="end">
                        <div className="flex flex-col space-y-1">
                          {/* User Info Header */}
                          <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">{userData.data.user.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {userData.data.user.email}
                            </p>
                          </div>

                          <div className="border-t border-b py-1">
                            {/* My Profile Link */}
                            <Link
                              href="/profile"
                              className="hover:bg-muted flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
                            >
                              <User size={16} />
                              <span>My Profile</span>
                            </Link>
                            <Link
                              href="/orders"
                              className="hover:bg-muted flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
                            >
                              <Package size={16} />
                              <span>My Orders</span>
                            </Link>
                            <Link
                              href="/my-review"
                              className="hover:bg-muted flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
                            >
                              <MessageCircle size={16} />
                              <span>My Reviews</span>
                            </Link>

                            {/* My Wishlist Link */}
                            <Link
                              href="/wishlist"
                              className="hover:bg-muted flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
                            >
                              <Heart size={16} />
                              <span>My Wishlist</span>
                            </Link>
                            <Link
                              href="/profile/change-password"
                              className="hover:bg-muted flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
                            >
                              <Lock size={16} />
                              <span>Change Password</span>
                            </Link>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>

                    {user.role === UserRole.SUPER_ADMIN ||
                    user.role === UserRole.ADMIN ||
                    user.role === UserRole.STAFF ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={getDashboardRoute()}
                            className="hover-button flex items-center gap-1 transition"
                          >
                            <LayoutDashboard size={22} />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Dashboard</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </>
                )}

                <ThemeToggle />
              </div>
            </TooltipProvider>
          </div>

          {/* Mobile Actions */}
          <TooltipProvider>
            <div className="flex items-center gap-4 lg:hidden">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex cursor-pointer items-center gap-1"
                    onClick={() => setCartOpen(true)}
                  >
                    <ShoppingCart />({cartData?.data?.items?.length ?? 0})
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cart</p>
                </TooltipContent>
              </Tooltip>
              <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

              {user && userData?.data && (
                <>
                  {/* Profile Picture/Avatar */}
                  {/* Mobile Actions - এখানেও Popover ব্যবহার করুন */}
                  {user && userData?.data && (
                    <>
                      {/* Profile Picture/Avatar with Popover - Mobile */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="cursor-pointer">
                            <Avatar className="h-7 w-7">
                              {userData.data.user.profilePicture && (
                                <AvatarImage
                                  src={userData.data.user.profilePicture}
                                  alt={userData.data.user.name}
                                />
                              )}
                              <AvatarFallback className="text-xs">
                                {getUserInitials(userData.data.user.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </PopoverTrigger>

                        <PopoverContent className="w-56 p-2" align="end" sideOffset={8}>
                          <div className="flex flex-col space-y-1">
                            {/* User Info Header */}
                            <div className="px-2 py-1.5">
                              <p className="text-sm font-medium">{userData.data.user.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {userData.data.user.email}
                              </p>
                            </div>

                            <div className="border-t border-b py-1">
                              {/* My Profile Link */}
                              <Link
                                href="/profile"
                                className="hover:bg-muted flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
                                onClick={() => document.body.click()}
                              >
                                <User size={16} />
                                <span>My Profile</span>
                              </Link>

                              <Link
                                href="/orders"
                                className="hover:bg-muted flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
                                onClick={() => document.body.click()}
                              >
                                <Package size={16} />
                                <span>My Orders</span>
                              </Link>

                              {/* My Wishlist Link */}
                              <Link
                                href="/wishlist"
                                className="hover:bg-muted flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
                                onClick={() => document.body.click()}
                              >
                                <Heart size={16} />
                                <span>My Wishlist</span>
                              </Link>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Dashboard Icon */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={getDashboardRoute()}
                            className="hover-button flex items-center gap-1 transition"
                          >
                            <LayoutDashboard size={20} />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Dashboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ThemeToggle />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Theme</p>
                </TooltipContent>
              </Tooltip>

              {user ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className="hover-button text-danger flex cursor-pointer items-center gap-1 transition"
                    >
                      <LogOut size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/login"
                      className="text-success hover-button cursor-pointer items-center gap-1 transition"
                    >
                      <LogIn size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign In</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Sheet>
                <SheetTrigger asChild>
                  <Menu className="cursor-pointer" size={24} />
                </SheetTrigger>

                <SheetContent side="left" className="z-100 block w-75 px-4 sm:w-85 lg:hidden">
                  {/* Header / Brand */}
                  <SheetHeader className="border-b">
                    <SheetTitle className="text-2xl font-extrabold tracking-widest">
                      STEPS
                    </SheetTitle>
                  </SheetHeader>

                  {/* Navigation */}
                  <nav className="mt-6 space-y-1">
                    {mainRoutes.map((route) => {
                      const isActive =
                        pathname === route.href ||
                        (route.href !== "/" && pathname.startsWith(route.href));

                      return (
                        <Link
                          key={route.href}
                          href={route.href}
                          className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {route.label}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="mt-5 ml-3">
                    <p className="mb-2 text-xs font-bold tracking-widest uppercase">Shop By</p>
                    <NavigationMenu>
                      <NavigationMenuList className="flex gap-6">
                        {Object.values(TargetAudience).map((audience) => {
                          const cats = getCategoriesForAudience(audience);
                          return (
                            <NavigationMenuItem key={audience}>
                              <NavigationMenuTrigger>
                                {AUDIENCE_LABELS[audience]}
                              </NavigationMenuTrigger>
                              <NavigationMenuContent>
                                <ul className="grid w-48">
                                  <li>
                                    <Link
                                      href={`/products?audience=${audience}`}
                                      className="hover:bg-muted block rounded-md px-3 py-2 text-sm font-medium transition-colors"
                                    >
                                      All
                                    </Link>
                                  </li>

                                  {isCategoriesLoading ? (
                                    <>
                                      <li className="px-3 py-2">
                                        <Skeleton className="h-4 w-28" />
                                      </li>
                                      <li className="px-3 py-2">
                                        <Skeleton className="h-4 w-24" />
                                      </li>
                                      <li className="px-3 py-2">
                                        <Skeleton className="h-4 w-20" />
                                      </li>
                                    </>
                                  ) : cats.length > 0 ? (
                                    cats.map((cat: any) => (
                                      <li key={cat._id ?? cat.id}>
                                        <Link
                                          href={`/products?audience=${audience}&category=${cat._id ?? cat.id}`}
                                          className="hover:bg-muted block rounded-md px-3 py-2 text-sm transition-colors"
                                        >
                                          {cat.name}
                                        </Link>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-muted-foreground px-3 py-2 text-xs">
                                      No categories
                                    </li>
                                  )}
                                </ul>
                              </NavigationMenuContent>
                            </NavigationMenuItem>
                          );
                        })}
                      </NavigationMenuList>
                    </NavigationMenu>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </TooltipProvider>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
