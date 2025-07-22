import { getUserSubscription } from '@/lib/polar/subscription-helpers';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "couldn't get user " }, { status: 400 });
    }

    const subData = await getUserSubscription(user?.id);
    
    // Transform the data to match what the frontend expects
    const transformedSubData = subData ? {
      id: subData.id,
      status: subData.status,
      plan_name: subData.plan_name,
      current_period_end: subData.current_period_end,
      cancel_at_period_end: subData.cancel_at_period_end,
      renews_at: subData.renews_at,
      polar_subscription_id: subData.polar_subscription_id,
    } : null;

    return NextResponse.json({
      subData: transformedSubData,
      hasActiveSub: !!subData && subData.status === 'active',
      status: subData?.status || 'inactive',
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
