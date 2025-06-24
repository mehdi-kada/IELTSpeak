import { verifyWebHookSignature } from "@/lib/polar-client";
import { createAdminClient } from "@/lib/server";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

("use server");

// this is the webhook handler implementation
// initiate the supabase client
const supabase = await createAdminClient();

// create the webhook handler function
export async function POST(request: NextRequest) {
  try {
    // need to make it a text for the hashing (polar signature)
    const body = await request.text();
    // before processing the webhook body we need to validate it first
    // get the signature from the request headers
    const signature = await request.headers.get("polar-signature");
    if (!signature) {
      console.error("no signature found in the webhook headres");
      return NextResponse.json({ error: "no signature" }, { status: 400 });
    }

    // verify that the webhook actually came from the request headers
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("POLAR_WEBHOOK_SECRET environment variable not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    //validate
    const isValid = verifyWebHookSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    // now the signature is safe for parsing
    const event = JSON.parse(body);

    // inser the even details to db for validations
    await supabase.from("payment_logs").insert({
      event_type: "webhook",
      polar_event_id: event.id,
      event_data: event,
      status: "received",
    });

    console.log("processing the webhook for polar : ", event.type);

    // handle different types of events
    // each type requires different processing
    switch (event.type) {
      case "subscription.created":
        await handleSubscriptionCreated(event.data);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(event.data);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data);
        break;
      default:
        console.log("unhandled webhook event type ", event.type);
        break;
    }

    //update log status to show successful processing
    await supabase
      .from("payment_logs")
      .update({ status: "processed" })
      .eq("polar_event_id", event.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("error while processing webhook");
    //insert error into db for debugging (log it)
    await supabase.from("payment_logs").insert({
      event_type: "webhook_error",
      error_message: error instanceof Error ? error.message : "unknown error",
      status: "error",
    });

    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
