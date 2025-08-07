"use client";

import { CustomerPortalButton } from "@/components/subscription/CustomerPortalButton";
import { useAuth } from "@/hooks/session/useAuth";

export default function CustomerPortalPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Portal
          </h1>
          <p className="text-gray-600 mb-8">
            Manage your orders, subscriptions, and account details
          </p>

          {user ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-medium">
                  Welcome back, {user.email}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Click below to access your customer portal
                </p>
              </div>

              <CustomerPortalButton />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📦</div>
                  <h3 className="font-medium">View Orders</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Track your purchases
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🔄</div>
                  <h3 className="font-medium">Subscriptions</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage recurring orders
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📄</div>
                  <h3 className="font-medium">Receipts</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Download invoices
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Sign in to access your portal
              </h2>
              <CustomerPortalButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
