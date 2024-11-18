import { auth } from "@/lib/auth";
import { CreateMessageInput } from "@/lib/models";
import {
  getFileContext,
  saveMessagesInTransaction,
} from "@/lib/retrieval-augmentation-gen";
import { buildPrompt } from "@/lib/utils";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

/**
 * POST /api/chat
 * Processes a message and returns a response.x
 * @param req The incoming request.
 * @returns A response indicating the status of the operation.
 * @throws If an error occurs while processing the request.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return new Response("Unauthorized", { status: 401 });

    if (req.headers.get("content-type") !== "application/json")
      return new Response("Invalid content type", { status: 400 });

    const { messages, chatId, fileId }: CreateMessageInput = await req.json();
    const fileContext = fileId
      ? await getFileContext(messages[messages.length - 1])
      : "";

    const systemPrompt = buildPrompt(fileContext);
    const response = await streamText({
      model: openai("gpt-4o-mini"),
      messages: [systemPrompt, ...messages],
      async onFinish({ text }) {
        saveMessagesInTransaction({ messages, chatId, text });
      },
    });

    return response.toDataStreamResponse();
  } catch (error) {
    console.error("POST /api/chat Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
