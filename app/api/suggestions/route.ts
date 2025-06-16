// used to recieve the vapi transcribts
// uses gemini and send back suggestions

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const text = await req.json();
  } catch (error) {}
}
