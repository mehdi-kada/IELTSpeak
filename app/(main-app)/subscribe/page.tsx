import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";
import React from "react";

function Subscribe() {
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12 space-y-4 ">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-gray-400">
          Unlock premium features and unlimited access to ToIELT
        </p>
        <SubscriptionStatus />
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
          title={"Fluency"}
          description={"Yearly"}
          price={"$100"}
          features={[
            "Unlimited Practice Sessions",
            "Advanced AI Feedback & Scoring",
            "Access to All Levels (A1-C2)",
            "Save & Review Session History",
          ]}
          variantId=""
          isPopular={true}
        />
      </div>
    </div>
  );
}

export default Subscribe;
