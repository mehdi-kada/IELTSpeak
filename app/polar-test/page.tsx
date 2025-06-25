import { PolarSetupHelper } from "@/components/debug/PolarSetupHelper";

export default function PolarTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Polar Payment Setup
      </h1>
      <PolarSetupHelper />
    </div>
  );
}
