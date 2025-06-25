import { PricingComponent } from "@/components/payments/PricingComponent";
import { SubscriptionStatus } from "@/components/payments/SubscriptionStatus";
import { createClient } from "@/lib/server";

export default async function SubscribePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to subscribe
          </h1>
          <p className="text-gray-600">
            You need to be logged in to manage your subscription.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Subscription Management</h1>
            <p className="text-xl text-gray-600">
              Manage your ToEILET subscription and unlock premium features
            </p>
          </div>

          {/* Current Subscription Status */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Current Status</h2>
            <SubscriptionStatus />
          </div>

          {/* Pricing Plans */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Available Plans</h2>
            <PricingComponent />
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">
              Premium Features Include:
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">🚀 Unlimited Practice</h4>
                <p className="text-gray-600 text-sm">
                  Practice as much as you want with no session limits
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎯 Advanced AI Feedback</h4>
                <p className="text-gray-600 text-sm">
                  Get detailed insights into your speaking performance
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">
                  📚 Comprehensive Vocabulary
                </h4>
                <p className="text-gray-600 text-sm">
                  Access to expanded vocabulary and topic categories
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">
                  📊 Detailed Progress Tracking
                </h4>
                <p className="text-gray-600 text-sm">
                  Monitor your improvement with advanced analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
