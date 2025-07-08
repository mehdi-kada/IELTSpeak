"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/oauth?next=/profile`
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } 
  };

  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <div className="bg-[#2F2F7F]/50 border border-white/10 rounded-2xl shadow-2xl shadow-[#2F2F7F]/20 p-6">
        <form onSubmit={handleSignUp} className="space-y-6">
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

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a3a]/60 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E62136] focus:border-[#E62136] transition-colors"
              />
            </div>
          </div>

          {/* Repeat Password Input */}
          <div>
            <label
              htmlFor="repeat-password"
              className="block text-sm font-medium text-gray-300"
            >
              Repeat Password
            </label>
            <div className="mt-1">
              <input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full bg-[#1a1a3a]/60 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E62136] focus:border-[#E62136] transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#E62136] hover:shadow-md hover:shadow-[#E62136]/30 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a3a] focus:ring-[#E62136] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating an account..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="flex-shrink mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        {/* Google Sign-up Button */}
        <div>
          <button
            onClick={handleSocialLogin}
            type="button"
            className="w-full flex items-center justify-center py-3 px-4 border border-white/20 rounded-lg shadow-sm text-sm font-medium text-white bg-[#2F2F7F] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a3a] focus:ring-white transition-all duration-200"
          >
            <svg
              className="w-5 h-5 mr-3"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.2 0 128.5 106.3 19.3 244 19.3c69.1 0 128.8 27.8 172.4 71.4l-64.5 64.5C330.4 132.8 291.1 112 244 112c-88.6 0-160.1 71.7-160.1 159.2s71.5 159.2 160.1 159.2c95.3 0 138.3-62.4 142.9-94.3H244V261.8h244z"
              ></path>
            </svg>
            Sign up with Google
          </button>
        </div>
      </div>

      {/* Sign In Link */}
      <p className="mt-0 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-[#E62136]/80 hover:text-[#E62136] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
