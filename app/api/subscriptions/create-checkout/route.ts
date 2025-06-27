// create payments checkout
import { createSubscriptionCheckout } from '@/lib/lemonsqueezy/lemonsqueezy';
import { getUserSubscription } from '@/lib/lemonsqueezy/subscription-helpers';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // get the current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("couldnt get user for checkout");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get the variant id from the request body
    const { varinatId } = await request.json();

    if (!varinatId) {
      console.log("no variant id provided ");
      return NextResponse.json(
        { error: "product variant id not provided " },
        { status: 400 }
      );
    }

    // check if the user has already an active subscription
    const userSubscribed = await getUserSubscription(user.id);
    if (userSubscribed) {
      return NextResponse.json(
        { error: "user already subscribed " },
        { status: 400 }
      );
    }

    // if the user doesnt have any subs , create a new chekcout session
    const checkoutUrl = await createSubscriptionCheckout(
      varinatId,
      user.id,
      user.email!
    );

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    // return the chekout url to the frontend
    return NextResponse.json({
      checkoutUrl,
      Message: "checkout url created successfully",
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
