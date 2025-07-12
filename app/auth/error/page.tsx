export const metadata: Metadata = {
  title: "Error",
  description: "something went wrong trying to sign you in ",
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-2 border-[#E91E63]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#E91E63]">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-muted-foreground">
                  Code error: {params.error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-gray-400">
                  An unspecified error occurred.
                </p>
              )}
              <div className="mt-4">
                <Link
                  href={"/dashboard"}
                  className=" p-2  font-bold border-2 rounded-lg border-[#E91E63] "
                >
                  Go back
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
