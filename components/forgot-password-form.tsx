"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <div className="bg-[#2F2F7F]/50 border border-white/10 rounded-2xl shadow-2xl shadow-[#2F2F7F]/20 p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
            <p className="text-gray-300">Password reset instructions sent</p>
            <p className="text-sm text-gray-400">
              If you registered using your email and password, you will receive
              a password reset email.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#2F2F7F]/50 border border-white/10 rounded-2xl shadow-2xl shadow-[#2F2F7F]/20 p-8">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-white">
              Reset Your Password
            </h2>
            <p className="text-gray-300">
              Type in your email and we&apos;ll send you a link to reset your
              password
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1a3a]/60 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E62136] focus:border-[#E62136] transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#E62136] hover:shadow-md hover:shadow-[#E62136]/30 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a3a] focus:ring-[#E62136] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Password Reset Link"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Back to Sign In Link */}
      <p className="mt-8 text-center text-sm text-gray-400">
        Remember your password?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-[#E62136]/80 hover:text-[#E62136] transition-colors"
        >
          Back to Sign in
        </Link>
      </p>
    </div>
  );
}
