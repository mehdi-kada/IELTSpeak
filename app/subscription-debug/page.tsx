import { SubscriptionDebugPanel } from "@/components/debug/SubscriptionDebugPanel";

export default function SubscriptionDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Subscription Debug
      </h1>
      <SubscriptionDebugPanel />
    </div>
  );
}
