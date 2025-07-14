"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { loginFormData, loginSchema } from "@/types/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<loginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (values: loginFormData) => {
    const { email, password } = values;
    setLoading(true);
    const supabase = createClient();
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/oauth?next=/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-[#374151] border border-white/10 rounded-2xl shadow-2xl shadow-[#374151]/20 p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <div className="mt-1">
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        className="w-full bg-[#1F2937] border border-white/20 rounded-lg px-4 py-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63] transition-colors"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <div className="text-sm">
                      <Link
                        href="/auth/forgot-password"
                        className="font-medium text-[#E91E63]/80 hover:text-[#E91E63] transition-colors"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </div>
                  <div className="mt-1">
                    <FormControl>
                      <Input
                        type="password"
                        required
                        {...field}
                        className="w-full bg-[#1F2937] border border-white/20 rounded-lg px-4 py-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63] transition-colors"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-[#E91E63]">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#E91E63] hover:shadow-md hover:shadow-[#E91E63]/30 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1F2937]cus:ring-[#E91E63] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </Form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="flex-shrink mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleSocialLogin}
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-white/20 rounded-lg shadow-sm text-sm font-medium text-white bg-[#374151] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1F2937]cus:ring-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            Sign in with Google
          </button>
        </div>
      </div>

      <p className="mt-0 text-center text-sm text-gray-400">
        Don't have an account?
        <Link
          href="/auth/sign-up"
          className="font-medium text-[#E91E63]/80 hover:text-[#E91E63] transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
