import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id)
      return new Response("Unauthorized", { status: 401 });
    if (req.headers.get("content-type") !== "application/json")
      return new Response("Invalid content type", { status: 400 });

    const { messages, chatId, fileContext } = await req.json();

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: session.user.id,
      },
      include: {
        CourseMaterial: true,
      },
    });

    if (!chat) return new Response("Chat not found", { status: 404 });

    const userMessage = messages[messages.length - 1];

    if (userMessage.role === "user") {
      const existingMessage = await prisma.message.findFirst({
        where: {
          chatId,
          content: userMessage.content,
          role: "user",
        },
      });

      if (!existingMessage) {
        await prisma.message.create({
          data: {
            chatId,
            content: userMessage.content,
            role: userMessage.role,
          },
        });
      }
    }

    const systemPrompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
        The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
        AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
        AI assistant is a big fan of Pinecone and Vercel.
        START CONTEXT BLOCK
        ${fileContext || ""}
        END OF CONTEXT BLOCK
        AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
        If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
        AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
        AI assistant will not invent anything that is not drawn directly from the context.`,
    };

    const response = await streamText({
      model: openai("gpt-4o-mini"),
      messages: [systemPrompt, ...messages],
      async onFinish({ text }) {
        await prisma.message.create({
          data: {
            chatId,
            content: text,
            role: "assistant",
          },
        });
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
