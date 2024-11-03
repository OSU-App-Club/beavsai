import { NextResponse } from "next/server";
import { openai } from "@/lib/openAiClient"; // adjust this import path

export async function POST(request: Request) {
  const { question, context } = await request.json();

  if (!question || !context) {
    return NextResponse.json(
      { error: "Missing question or context" },
      { status: 400 },
    );
  }

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: `Context: ${context}\nQuestion: ${question}` },
    ],
    stream: true, // Enable streaming
  });

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0].delta?.content || ""; // Retrieve the text content
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(text)); // Send the chunk as it arrives
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}
