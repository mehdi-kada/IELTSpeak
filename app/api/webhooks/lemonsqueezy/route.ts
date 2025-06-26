// the main webhook for lemon
import crypto from "crypto";


import { NextRequest, NextResponse } from "next/server";
import { cancelSubFromDB, upsertSubscription } from "@/lib/lemonsqueezy/subscription-helpers";



// function to verify the authenticity of the secret
export const verifyWebhookSignature = (body: string, signature: string): boolean => {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const expectedSingature = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(secret, "hex"),
    Buffer.from(expectedSingature, "hex")
  );
};

export async function POST(request: NextRequest) {
  try {
    // get it as text for the signature verification to work
    const body = await request.text();
    const signature = request.headers.get("X-Signature");
    if (!signature) {
      console.error("signature was not provided by lemon");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    if (!verifyWebhookSignature(body, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "invalid signature" }, { status: 400 });
    }

    // if signature is valid , parse it
    let event;
    try {
      event = JSON.parse(body);
    } catch (parseError) {
      console.error("failed to parse webhook ");
      return NextResponse.json({ error: "parse error " }, { status: 400 });
    }

    // get info from the payload
    const eventType = event.meta?.event_name;
    const subscriptionData = event.data;
    const metaCustomData = event.meta?.custom_data;

    // Handle different subscription events
    switch (eventType) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
        await handleSubscriptionUpdate(
          subscriptionData,
          metaCustomData,
        );
        break;

      case "subscription_canceled":
      case "subcription_expired":
        await handleSubCancellation(subscriptionData.id);
        break;
      default:
        console.log("unhandled event type : ", eventType);
    }

    console.log("webhook processing completed successfully");
    return NextResponse.json({ recieved: true });
  } catch (error) {
    console.error("error processing web hook : ", error);
    return NextResponse.json(
      {
        error: "internal server error",
      },
      { status: 500 }
    );
  }
}

export const handleSubscriptionUpdate = async (
  subscriptionData: any,
  metaCustomData: any
) => {
  try {
    const attributes = subscriptionData.attributes;
    const userId = metaCustomData.user_id;
    // prepare data for the database
    const subscriptionUpdate = {
      user_id: userId,
      lemonsqueezy_subscription_id: subscriptionData.id,
      lemonsqueezy_customer_id: attributes.customer_id.toString(),
      status: attributes.status,
      plan_name: attributes.product_name || "Monthly Subscription",
      current_period_start: attributes.renews_at,
      current_period_end: attributes.ends_at,
      cancel_at_period_end: attributes.cancelled || false,
      renews_at: attributes.renews_at,
    };
    const success = await upsertSubscription(subscriptionUpdate);
    if(!success){
        console.log("error while upserting subscription data to database")
    }else{
        console.log("updated db with subscription data successfully ")
    }
  } catch (error) {
    console.error("Error handling subscription update: ", error)
  }
};

export const handleSubCancellation = async(subscriptionData: any) =>{
    try{

        const success = await cancelSubFromDB(subscriptionData)
        if(success){
            console.log("canceled subscription successfully from db ")
        }else{
            console.log("failed to cancel subscription from db")
        }
    }catch(error){
            console.error(
      ` Error handling subscription cancellation:`,
      error
    );
    }
}