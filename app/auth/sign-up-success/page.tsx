export const metadata: Metadata = {
  title: "Sign Up Successful",
  description:
    "Thank you for signing up! Please check your email to confirm your account before signing in to IELTSpeak.",
};

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
        <div className="flex items-center justify-center mb-2 gap-1">
          <Link href="/">
            <h1 className="text-4xl text-center font-bold">IELTSpeak</h1>
          </Link>
        </div>
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card className=" border-2 bg-[#2F2F7F]/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl text-red-700">
                  Thank you for signing up!
                </CardTitle>
                <CardDescription>Check your email to confirm</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You&apos;ve successfully signed up. Please check your email to
                  confirm your account before signing in.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
