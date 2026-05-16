"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useChangePasswordMutation } from "@/redux/features/auth/auth.api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

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

  const [changePassword] = useChangePasswordMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword({
        password: formData.oldPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      toast.success(result.message || "Password changed successfully!");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || "Failed to change password. Please check your old password.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-card-primary mx-auto max-w-2xl overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5"
      >
        {/* ── Header  */}
        <div className="border-border border-b bg-linear-to-b from-transparent to-black/5 p-10 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-card-primary/80 border-border mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 shadow-sm"
          >
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Lock className="text-card-foreground h-10 w-10" />
            </motion.div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight">
            Security Center
          </motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground mt-2 text-sm">
            Update your account password to ensure your data stays protected.
          </motion.p>
        </div>

        {/* ── Form  */}
        <form onSubmit={handleSubmit} className="space-y-8 p-10">
          <div className="grid grid-cols-1 gap-6">
            {/* Old Password */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <div className="group relative">
                <Input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="text-muted-foreground hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* New Password */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="group relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-muted-foreground hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Must be at least 6 characters long.
              </p>
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="group relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Submit */}
          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="bg-button-primary text-button-primary-foreground group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl px-8 py-4 text-sm font-bold shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Updating Security...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    <span>Secure My Account</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
