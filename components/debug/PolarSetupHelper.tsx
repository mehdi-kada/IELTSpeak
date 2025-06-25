"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PolarSetupHelper() {
  const [productId, setProductId] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState<any>(null);

  const fetchProductInfo = async () => {
    try {
      const response = await fetch("/api/polar/products");
      const data = await response.json();
      setProductInfo(data);
    } catch (error) {
      setProductInfo({ error: "Failed to fetch product info" });
    }
  };

  const testCheckout = async () => {
    if (!productId.trim()) {
      alert("Please enter a product ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: productId.trim() }),
      });

      const data = await response.json();
      setTestResult({
        status: response.status,
        ok: response.ok,
        data: data,
      });
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Polar Setup Helper</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">
              Step 1: Check Environment Variables
            </h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm">
                Make sure these are set in your <code>.env.local</code>:
              </p>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                {`NEXT_PUBLIC_APP_URL="http://localhost:3000"
POLAR_ACCESS_TOKEN="polar_pat_your_token"
POLAR_WEBHOOK_SECRET="your_webhook_secret"
POLAR_SERVER="sandbox"`}
              </pre>
            </div>
          </div>{" "}
          <div>
            <h3 className="font-semibold mb-2">Step 2: Get Your Product ID</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-2">
              <p className="text-sm mb-2">
                1. Go to your{" "}
                <a
                  href="https://sandbox-polar.sh"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Polar Dashboard
                </a>
                <br />
                2. Navigate to Products
                <br />
                3. Create or select a product
                <br />
                4. Copy the Product ID (it should look like:{" "}
                <code>123e4567-e89b-12d3-a456-426614174000</code>)
              </p>
              <Button onClick={fetchProductInfo} variant="outline" size="sm">
                Get Setup Instructions
              </Button>
            </div>

            {productInfo && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(productInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              Step 3: Test Checkout Creation
            </h3>
            <div className="space-y-2">
              <Label htmlFor="productId">Polar Product ID</Label>
              <Input
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                className="font-mono text-sm"
              />
              <Button
                onClick={testCheckout}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Testing..." : "Test Checkout Creation"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {testResult && (
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Test Result</h3>
          <div
            className={`p-4 rounded-lg ${
              testResult.ok ? "bg-green-50" : "bg-red-50"
            }`}
          >
            {testResult.ok ? (
              <div>
                <p className="text-green-800 font-semibold">✅ Success!</p>
                <p className="text-sm text-green-700">
                  Checkout URL:{" "}
                  <a
                    href={testResult.data.url}
                    target="_blank"
                    className="underline"
                  >
                    {testResult.data.url}
                  </a>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-800 font-semibold">❌ Error</p>
                <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-2">Common Issues & Solutions</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>❌ "Input should be a valid UUID":</strong>
            <p>
              Your product ID format is wrong. It should be a UUID like:{" "}
              <code>123e4567-e89b-12d3-a456-426614174000</code>
            </p>
          </div>
          <div>
            <strong>❌ "Input should be a valid URL":</strong>
            <p>
              Your <code>NEXT_PUBLIC_APP_URL</code> is not set correctly in{" "}
              <code>.env.local</code>
            </p>
          </div>
          <div>
            <strong>❌ "Unauthorized":</strong>
            <p>
              Check your <code>POLAR_ACCESS_TOKEN</code> in{" "}
              <code>.env.local</code>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
