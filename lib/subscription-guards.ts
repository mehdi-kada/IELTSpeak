import { createClient } from "@/lib/server";
import { isUserSubscribed } from "@/lib/subscription-helpers";
import { redirect } from "next/navigation";

/**
 * Server-side subscription protection middleware
 * Use this in page components to protect premium features
 */
export async function requireSubscription() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const subscribed = await isUserSubscribed(user.id);

  if (!subscribed) {
    redirect("/subscribe");
  }

  return user;
}

/**
 * Example usage in a page component (server-side):
 *
 * export default async function PremiumPage() {
 *   // This will redirect to /subscribe if user is not subscribed
 *   const user = await requireSubscription();
 *
 *   return (
 *     <div>
 *       <h1>Premium Feature Page</h1>
 *       <p>Welcome {user.email}! You have access to premium features.</p>
 *     </div>
 *   );
 * }
 */
