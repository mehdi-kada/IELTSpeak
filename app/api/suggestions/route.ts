// used to recieve the vapi transcribts
// uses gemini and send back suggestions

import { GoogleGenerativeAI } from "@google/generative-ai";

import { NextRequest, NextResponse } from "next/server";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  // get the prompt
  const { prompt } = await req.json();

  // get the model
  const model = genAi.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  try {
    //initialze a streaming generatinve session with the responsele
    const result = await model.generateContentStream(prompt);

    // create a new readable stream to send the response
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
