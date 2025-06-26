import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { createClient } from "@/lib/server";

export default async function SubscribePage() {
  // Get the current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            Subscribe to ToEILET Premium
          </h1>
          <p className="text-gray-600 mb-8">
            Please log in to manage your subscription.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">
          Unlock premium features and unlimited access to ToEILET
        </p>
      </div>

      {/* Current Subscription Status */}
      <div className="mb-8">
        <SubscriptionStatus />
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <SubscriptionCard
          title="Free"
          description="Perfect for trying out ToEILET"
          price="$0"
          features={[
            "5 practice sessions per month",
            "Basic feedback",
            "Limited access to levels",
          ]}
          variantId="" // No variant ID for free plan
        />

        {/* Premium Plan */}
        <SubscriptionCard
          title="Premium"
          description="Full access to all ToEILET features"
          price="$9.99"
          features={[
            "Unlimited practice sessions",
            "Advanced AI feedback",
            "Access to all levels",
            "Progress tracking",
            "Priority support",
            "Export results",
          ]}
          variantId="871461" // Your actual variant ID
          isPopular={true}
        />
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue
              to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              You can use ToEILET with limited features for free. Upgrade to
              premium to unlock all features.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              How secure is my payment information?
            </h3>
            <p className="text-gray-600">
              All payments are processed securely through LemonSqueezy, a
              trusted payment processor. We don't store your payment
              information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
