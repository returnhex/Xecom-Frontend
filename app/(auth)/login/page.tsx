"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ModernSneakerShowcase from "./component/annimationSneakersImage2";
import { useLoginMutation } from "@/redux/features/auth/auth.api";
import { useMergeGuestCartMutation } from "@/redux/features/order/cart.api";
import { CartMergeConflict } from "@/redux/features/order/dto/cart.dto";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/auth/authSlice";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { TUser } from "@/redux/features/auth/authSlice";
import { UserRole } from "@/redux/features/auth/dto/auth.dto";

// Define form types
interface LoginFormData {
  email: string;
  password: string;
}

interface ForgotPasswordFormData {
  email: string;
}

const Login = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [mergeGuestCart] = useMergeGuestCartMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
    reset: resetForgot,
  } = useForm<ForgotPasswordFormData>();

  const handleForgotSubmit = async (data: ForgotPasswordFormData) => {
    console.log("forget password data", data);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    resetForgot();
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data).unwrap();

      if (response.success && response.data.accessToken) {
        const accessToken = response.data.accessToken;

        // Decode the JWT token
        const decodedUser = jwtDecode<TUser>(accessToken);

        // Dispatch user and token to Redux store
        dispatch(setUser({ user: decodedUser, token: accessToken }));

        // Show success message
        toast.success(response.message || "Logged in successfully");

        // Merge guest cart if one exists
        const guestToken = localStorage.getItem("guestToken");
        if (guestToken) {
          try {
            const mergeResult = await mergeGuestCart({ guestToken }).unwrap();
            const mergeData = (mergeResult as any)?.data ?? mergeResult;
            if (mergeData?.merged) {
              localStorage.removeItem("guestToken");
              (mergeData.conflicts as CartMergeConflict[] | undefined)?.forEach((conflict) => {
                toast.warning(conflict.message);
              });
            }
          } catch {
            // silently ignore merge errors
          }
        }

        // Redirect based on role
        if (
          decodedUser.role === UserRole.SUPER_ADMIN ||
          decodedUser.role === UserRole.ADMIN ||
          decodedUser.role === UserRole.STAFF
        ) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Login failed. Please try again.");
    }
  };

  // Google Sign
  const handleGoogleSignIn = async () => {
    console.log("google login");
  };

  const handleCredentialLogin = (response: any) => {
    const token = response.credential;

    if (token) {
      const decodedUser = jwtDecode<TUser>(token);

      dispatch(setUser({ user: decodedUser, token }));

      toast.success("Google login successful");

      if (
        decodedUser.role === UserRole.SUPER_ADMIN ||
        decodedUser.role === UserRole.ADMIN ||
        decodedUser.role === UserRole.STAFF
      ) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="container grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
      <div className="hidden justify-center lg:flex">
        <ModernSneakerShowcase />
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md space-y-2">
          <div className="text-center">
            <Link href="/" className="text-3xl font-bold">
              Xecom
            </Link>
            <h2 className="text-foreground mt-4 text-3xl font-bold">Sign in to your account</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Or{" "}
              <Link href="/register" className="text-lg font-semibold">
                create a new account
              </Link>
            </p>
          </div>

          <Card className="py-6">
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    User ID / Email
                  </label>
                  <div className="mt-1">
                    <Input
                      {...register("email", {
                        required: "User ID is required",
                      })}
                      type="text"
                      placeholder="Enter your user ID or email"
                      className={errors.email ? "border-danger" : ""}
                    />
                    {errors.email && (
                      <p className="text-primary mt-1 text-sm">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <div className="mt-1">
                    <Input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      type="password"
                      placeholder="Enter your password"
                      className={errors.password ? "border-danger" : ""}
                    />
                    {errors.password && (
                      <p className="text-primary mt-1 text-sm">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <button type="button" onClick={showModal} className="font-medium">
                      Forgot your password?
                    </button>
                  </div>
                </div>

                <div>
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </form>
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center"></div>
                <div className="relative flex justify-center text-sm">
                  <span className="text-muted-foreground bg-transparent px-2">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col justify-center space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-white py-3 font-medium shadow-sm transition-all dark:bg-white/10"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 533.5 544.3"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.3H272v95h146.9c-6.3 34-25.1 62.8-53.6 82v68h86.7c50.9-46.9 80.5-115.9 80.5-194.7z"
                      fill="#4285F4"
                    />
                    <path
                      d="M272 544.3c72.6 0 133.5-24 178-65.1l-86.7-68c-24 16-54.7 25.5-91.3 25.5-70.1 0-129.5-47.2-150.7-110.6H33.7v69.4C78.1 487 168.4 544.3 272 544.3z"
                      fill="#34A853"
                    />
                    <path
                      d="M121.3 341.1c-8.6-25.7-8.6-53.6 0-79.3V192.4H33.7c-31.7 62.8-31.7 137.2 0 200l87.6-50.3z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M272 107.7c39.6 0 75.2 13.6 103.3 40.5l77.6-77.6C401.5 24.7 340.6 0 272 0 168.4 0 78.1 57.3 33.7 144.1l87.6 50.3C142.5 155 201.9 107.7 272 107.7z"
                      fill="#EA4335"
                    />
                  </svg>

                  <span>Sign up with Google</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Forgot Password Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="mx-4 w-full max-w-md">
                <CardHeader>
                  <CardTitle>Reset Password</CardTitle>
                  <CardDescription>
                    Enter your email to receive a password reset link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitForgot(handleForgotSubmit)} className="space-y-2">
                    <div>
                      <label
                        htmlFor="forgot-email"
                        className="text-muted-foreground block text-sm font-medium"
                      >
                        Email Address
                      </label>
                      <div className="mt-1">
                        <Input
                          {...registerForgot("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                          type="email"
                          placeholder="Enter your email"
                          className={forgotErrors.email ? "border-danger" : ""}
                        />
                        {forgotErrors.email && (
                          <p className="text-primary mt-1 text-sm">{forgotErrors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        Send Reset Link
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
