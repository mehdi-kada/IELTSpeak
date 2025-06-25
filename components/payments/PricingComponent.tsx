"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionButton } from "./SubscriptionButton";
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  productId: string;
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 practice sessions per month",
      "Basic feedback",
      "Limited vocabulary",
    ],
    productId: "free",
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "per month",
    features: [
      "Unlimited practice sessions",
      "Advanced AI feedback",
      "Comprehensive vocabulary",
      "Detailed progress tracking",
      "Priority support",
    ],
    productId:
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || "your-polar-product-id",
    popular: true,
  },
];

export function PricingComponent() {
  const { isSubscribed, loading } = useSubscriptionStatus();

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600">
          Start free, upgrade when you're ready for more features
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`p-8 relative ${
              plan.popular ? "border-2 border-blue-500 shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600 ml-2">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {plan.productId === "free" ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : isSubscribed ? (
                <Button variant="outline" className="w-full" disabled>
                  ✓ Subscribed
                </Button>
              ) : (
                <SubscriptionButton
                  productId={plan.productId}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Loading..." : "Subscribe Now"}
                </SubscriptionButton>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8 text-sm text-gray-600">
        <p>All plans include a 7-day free trial. Cancel anytime.</p>
      </div>
    </div>
  );
}

export default PricingComponent;
