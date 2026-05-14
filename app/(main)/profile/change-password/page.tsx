"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useChangePasswordMutation } from "@/redux/features/auth/auth.api";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [changePassword] = useChangePasswordMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword({
        password: formData.oldPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      setSuccessMsg(result.message || "Password changed successfully!");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated successfully");
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || "Failed to change password. Please check your old password.";
      setErrorMsg(errorMessage);
      console.error("Change password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="bg-card-primary mx-auto max-w-3xl overflow-hidden rounded-lg shadow-sm">
        {/* ── Header  */}
        <div className="border-border border-b p-12 text-center">
          <div className="bg-secondary/20 border-success/10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-sm">
            <Lock className="text-primary h-10 w-10" />
          </div>

          <h1 className="mt-4 mb-2 text-2xl font-semibold">Change Password</h1>
          <p className="text-muted-foreground text-sm">
            Update your account password to stay secure.
          </p>
        </div>

        {/* ── Form  */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 gap-6">
            {/* Old Password */}
            <div className="space-y-1.5">
              <label className="text-foreground text-sm font-medium">Old Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter your current password"
                  className="bg-secondary border-border focus:ring-ring w-full rounded-md border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-foreground text-sm font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter a strong new password"
                  className="bg-secondary border-border focus:ring-ring w-full rounded-md border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-foreground text-sm font-medium">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-type your new password"
                  className="bg-secondary border-border focus:ring-ring w-full rounded-md border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback banners */}
          <div className="mt-8">
            {successMsg && (
              <div className="bg-success/10 border-success text-success mb-6 rounded-md border p-4 text-sm">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-danger/10 border-danger text-danger mb-6 rounded-md border p-4 text-sm">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="mt-4 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-button-primary text-button-primary-foreground flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating…
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
