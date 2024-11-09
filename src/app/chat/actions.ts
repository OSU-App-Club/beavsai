"use server";

import { auth } from "@/lib/auth";
import { CreateChatInput } from "@/lib/models";
import { prisma } from "@/lib/prisma";
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
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session?.user?.id !== input.userId) {
    throw new Error("Unauthorized");
  }

  if (input.fileId) {
    const file = await prisma.courseMaterial.findUnique({
      where: {
        id: input.fileId,
      },
    });

    if (!file) {
      throw new Error("File not found");
    }

    if (file.userId !== input.userId) {
      throw new Error("Unauthorized");
    }

    try {
      await axios.post("http://localhost:3000/api/embeddings", {
        fileName: file.fileName,
      });
    } catch (error) {
      console.error("Failed to create embeddings:", error);
    }
  }

  const chat = await prisma.chat.create({
    data: {
      userId: input.userId,
      fileId: input.fileId,
      ...(input.initialMessage && {
        messages: {
          create: {
            content: input.initialMessage,
            role: "user",
          },
        },
      }),
    },
    include: {
      messages: true,
    },
  });

  revalidatePath("/chat");

  return chat;
}

/**
 * Deletes a chat by ID
 *
 * @param chatId - The chat ID
 */
export async function deleteChat(chatId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (!chatId) throw new Error("Chat ID is required");
  if (!session?.user?.id) throw new Error("User ID is required");
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
  // Check if the chat belongs to the user
  if (chat.userId !== session.user.id) throw new Error("Unauthorized");

  // If the chat has indexed embeddings in pinecone
  if (chat.CourseMaterial?.isIndexed) {
    // Delete the document(s) from pinecone
    await axios.delete(`http://localhost:3000/api/embeddings?chatId=${chatId}`);
  }

  // Finally, delete the chat
  await prisma.chat.delete({
    where: {
      id: chatId,
    },
  });
  revalidatePath("/chat");
}
