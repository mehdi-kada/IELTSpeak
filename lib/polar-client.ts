import { Polar } from "@polar-sh/sdk";
import crypto from "crypto";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
});

export function verifyWebHookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Polar uses HMAC-SHA256 for webhook signatures
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("hex");

    // Compare signatures securely
    return crypto.timingSafeEqual(
      Buffer.from(signature.replace("sha256=", ""), "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}
