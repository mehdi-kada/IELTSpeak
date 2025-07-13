"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { updatePasswordFormData, updatePasswordSchema } from "@/types/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<updatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      repeatPassword: "",
    },
  });

  const handleForgotPassword = async (data: updatePasswordFormData) => {
    setError(null);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      router.push("/login");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <div className="flex items-center justify-center mb-2 gap-1">
        <Link href="/">
          <h1 className="text-4xl text-center font-bold text-red-600">
            IELTSpeak
          </h1>
        </Link>
      </div>
      <Card className="bg-[#2F2F7F]/70 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            Reset Your Password
          </CardTitle>
          <CardDescription>
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleForgotPassword)}>
              <div className="flex flex-col gap-6">
                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">New Wpassword</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            className="bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600 px-4 py-3"
                            type={showPassword ? "text" : "password"}
                            placeholder="New password"
                            required
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            tabIndex={-1}
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="repeatPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Confirm password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            className="bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600 px-4 py-3"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            required
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            tabIndex={-1}
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:shadow-md hover:shadow-red-800"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save new password"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}