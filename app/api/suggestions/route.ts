// used to recieve the vapi transcripts
// uses gemini and send back suggestions

import { GoogleGenerativeAI } from "@google/generative-ai";

import { NextRequest, NextResponse } from "next/server";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          console.log("error in stream : ", error);
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
