export const metadata: Metadata = {
  title: "Forgot Password",
  description: "forgot your password ? no worries we will help you reset it ",
};
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Metadata } from "next";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-2 gap-1">
          <Link href="/">
            <h1 className="text-4xl text-center font-bold">IELTSpeak</h1>
          </Link>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
