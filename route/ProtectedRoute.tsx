"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { UserRole } from "@/redux/features/auth/dto/auth.dto";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  useEffect(() => {
    // If no user is logged in, redirect to login
    // if (!user) {
    //   router.push("/login");
    //   return;
    // }

    // If allowed roles are specified and user's role is not in the list, redirect to home
    if (user && allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.push("/");
    }
  }, [user, allowedRoles, router]);

  // Don't render anything while checking authentication
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render if user doesn't have the required role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
