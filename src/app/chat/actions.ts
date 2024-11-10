"use server";

import { auth } from "@/lib/auth";
import { type CreateChatInput, type CreateChatWithMsg } from "@/lib/models";
import { prisma } from "@/lib/prisma";
import { buildPrompt } from "@/lib/utils";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import axios from "axios";
import { Session } from "next-auth";
import { revalidatePath } from "next/cache";

/**
 * Creates a chat
 *
 * @param input - The chat input
 * @param session - The current client's session
 */
export async function createChat(input: CreateChatInput, session: Session) {
  if (!session) throw new Error("Unauthorized");
  if (session?.user?.id !== input.userId) throw new Error("Unauthorized");

  // If there's a file for this chat as context, embed it in Pinecone
  if (input.fileId && input.userId)
    await embedFileInPinecone(input.fileId, input.userId);

  // Generate the initial message from the AI
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: buildPrompt(undefined, input.initialMessage).content,
  });

  // Create the chat with the initial message
  const chat = await createChatWithMessages({
    userId: input.userId,
    fileId: input.fileId,
    initialMessage: input.initialMessage,
    initMsgAIResponse: text,
  });

  // Revalidate the chat list
  revalidatePath("/chat");

  return chat;
}

/**
 * Deletes a chat by ID
 * This also deletes the document(s) from Pinecone if the file is indexed
 * @param chatId - The chat ID
 */
export async function deleteChat(chatId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (!chatId) throw new Error("Chat ID is required");
  if (!session?.user?.id) throw new Error("User ID is required");
  try {
    // Check if the chat exists
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        CourseMaterial: true,
      },
    });
    if (!chat) throw new Error("Chat not found");
    // Ensure the chat belongs to the user
    if (chat.userId !== session.user.id) throw new Error("Unauthorized");

    // If the the file is indexed, OK to delete the document(s) from pinecone
    if (chat.CourseMaterial?.isIndexed && chat.CourseMaterial?.id) {
      // Trigger the deletion of the document(s) from Pinecone through our API
      await axios.delete(
        `http://localhost:3000/api/embeddings?chatId=${chatId}`,
      );
    }

    // Finally, delete the chat
    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });
    revalidatePath("/chat");
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw new Error("Failed to delete chat");
  }
}

/**
 * Function to create a chat and initial messages in a transaction.
 * @param params Object containing the parameters.
 * @returns The created chat with messages.
 */
export async function createChatWithMessages({
  userId,
  fileId,
  initialMessage,
  initMsgAIResponse,
}: CreateChatWithMsg) {
  try {
    // Create the chat with the initial message (if any)
    const chat = await prisma.$transaction(async (prisma) => {
      const createdChat = await prisma.chat.create({
        data: {
          userId,
          fileId,
          ...(initialMessage && {
            messages: {
              create: {
                content: initialMessage,
                role: "user",
              },
            },
          }),
        },
        include: {
          messages: true,
        },
      });

      // If and only if the AI generated an initial message, create it
      if (initMsgAIResponse) {
        await prisma.message.create({
          data: {
            chatId: createdChat.id,
            content: initMsgAIResponse,
            role: "assistant",
          },
        });
      }

      return createdChat;
    });

    return chat;
  } catch (error) {
    console.error("Error creating chat with messages:", error);
    throw error;
  }
}

/**
 * Embed the file's contents in Pinecone
 * @param fileId - The file ID
 * @param userId - The user ID
 */
async function embedFileInPinecone(fileId: string, userId: string) {
  const file = await prisma.courseMaterial.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!file) throw new Error("File not found");
  // Validate the user owns the file (TODO: Support multi-tenant?)
  if (file.userId !== userId) throw new Error("Unauthorized");

  // Index the document in Pinecone
  const response = await axios.post("http://localhost:3000/api/embeddings", {
    data: {
      ...file,
      isOwner: true,
      visibility: file.visibility as "PUBLIC" | "PRIVATE",
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to index the document");
  }
}
