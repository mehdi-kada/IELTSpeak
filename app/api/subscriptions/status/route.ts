import { getUserSubscription } from '@/lib/lemonsqueezy/subscription-helpers';
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
      return NextResponse.json({ error: "couldnt get user " }, { status: 400 });
    }

    const subData = await getUserSubscription(user?.id);
    return NextResponse.json({
      subData,
      hasActiveSub: !!subData,
      status: subData.status === "active",
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
