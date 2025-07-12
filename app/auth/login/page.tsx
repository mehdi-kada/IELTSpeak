export const metadata: Metadata = {
  title: "Login",
description: "Sign in to your IELTSpeak account to continue your personalized AI speaking practice and track your progress toward your IELTS goals.",};

import { LoginForm } from "@/components/login-form";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="py-6">
          <div className="flex items-center justify-center mb-2 gap-1">
            <Link href="/">
              <h1 className="text-4xl text-center font-bold text-[#E91E63]">IELTSpeak</h1>
            </Link>
          </div>

          <p className="text-gray-400 text-center">
            Welcome back! Please sign in to your account.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
