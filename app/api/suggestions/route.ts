// used to recieve the vapi transcribts
// uses gemini and send back suggestions

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Modern_Antiqua } from "next/font/google";
import { NextRequest, NextResponse } from "next/server";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  // get the prompt
  const { prompt } = await req.json();

  // initialize the google ai api
  const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

  // get the model
  const model = genAi.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  try {
    //initialze a streaming generatinve session with the response
    const result = await model.generateContentStream(prompt);

    // create a new readable stream to send the response
    const stream = new ReadableStream({
      async start(controller){
        
      }
    })

  } catch (error) {}
}
