"use server";

import { auth } from "@/lib/auth";
import { CreateChatInput } from "@/lib/models";
import { prisma } from "@/lib/prisma";
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
  });
  if (!chat) throw new Error("Chat not found");
  // Check if the chat belongs to the user
  if (chat.userId !== session.user.id) throw new Error("Unauthorized");
  // Delete the chat
  await prisma.chat.delete({
    where: {
      id: chatId,
    },
  });
  revalidatePath("/chat");
}
