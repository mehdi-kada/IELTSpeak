export const metadata: Metadata = {
  title: "Upgrade",
  description:
    "Upgrade to IELTSpeak Premium for unlimited practice sessions, advanced AI feedback, and full access to all features. Choose the plan that fits your learning goals and boost your IELTS speaking score.",
};

import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";
import { Metadata } from "next";
import React, { Suspense } from "react";

function Subscribe() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12 space-y-4 ">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-gray-400">
          Unlock premium features and unlimited access to IELTSpeak
        </p>
        <Suspense fallback={null}>
          <SubscriptionStatus />
        </Suspense>
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-center gap-10">
        {/* for monthly sub  */}
        <SubscriptionCard
          title={"fluency"}
          description={"monthly"}
          price={"$9.99"}
          features={[
            "Unlimited Practice Sessions",
            "Advanced AI Feedback & Scoring",
            "Access to All Levels (A1-C2)",
            "Save & Review Session History",
          ]}
          variantId="871461"
          isPopular={false}
        />
        {/* for yearly sub */}
        <SubscriptionCard
          title={"Language Mastery"}
          description={"Yearly"}
          price={"$99.99"}
          features={[
            "Unlimited Practice Sessions",
            "Advanced AI Feedback & Scoring",
            "Access to All Levels (A1-C2)",
            "Save & Review Session History",
          ]}
          variantId="875882"
          isPopular={true}
        />
      </div>
    </div>
  );
}

export default Subscribe;
