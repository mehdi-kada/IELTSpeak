// Example usage of the new Polar integration

import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';

// Example subscription cards with Polar support
const subscriptionPlans = [
  {
    title: "Monthly Plan",
    description: "month",
    price: "$9.99",
    features: [
      "Unlimited practice sessions",
      "Detailed feedback",
      "Progress tracking",
      "All IELTS levels"
    ],
    productId: process.env.NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID!, // Polar
    variantId: "legacy-monthly-variant", // LemonSqueezy (fallback)
    isPopular: false,
  },
  {
    title: "Yearly Plan",
    description: "year", 
    price: "$99.99",
    features: [
      "Everything in Monthly",
      "Priority support",
      "Advanced analytics",
      "Export reports",
      "Save 17%"
    ],
    productId: process.env.NEXT_PUBLIC_POLAR_YEARLY_PRODUCT_ID!, // Polar
    variantId: "legacy-yearly-variant", // LemonSqueezy (fallback)
    isPopular: true,
  }
];

// Usage in your subscription page
export default function SubscriptionPage() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {subscriptionPlans.map((plan, index) => (
        <SubscriptionCard
          key={index}
          {...plan}
        />
      ))}
    </div>
  );
}
