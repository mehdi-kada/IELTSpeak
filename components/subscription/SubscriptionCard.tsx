"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubscriptionCardProps } from "@/types/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubscriptionCard({
  title,
  description,
  price,
  features,
  variantId,
  isPopular,
}: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ variantId }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("error while fetching checkout url");
        throw new Error(data.error);
      }
      router.push(data.checkoutUrl);
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Failed to start checkout process. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card
      className={`relative w-full max-w-md  ${
        isPopular ? " bg-[#2F2F7F] border-2 border-red-700 " : "bg-[#2F2F7F]/50"
      } transform hover:-translate-y-2 transition-transform duration-300`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 ">
          <span className="bg-red-600 rounded-2xl font-bold px-4 ">
            BEST VALUE
          </span>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          {title}
        </CardTitle>
        <CardDescription className="text-center text-xl text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center my-6">
          <span className="text-5xl font-black">{price}</span>
          <span className="text-lg text-gray-400">
            / {isPopular ? "year" : "month"}
          </span>
        </div>

        <ul className="space-y-1 my-8 ">
          {features.map((f, index) => (
            <li key={index} className="flex gap-3 items-center">
              <svg
                className="h-6 w-6 text-green-400 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="mt-2">{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`w-full font-bold py-3 px-6 rounded-lg transition-colors ${
            isPopular
              ? "bg-red-600 hover:shadow-md hover:shadow-red-600/50"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Choose {description} {isPopular ? "and save 16% " : ""}
        </button>
      </CardFooter>
    </Card>
  );
}
