"use server";

import { CreateChatInput } from "@/lib/models";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { revalidatePath } from "next/cache";

export async function createChat(input: CreateChatInput, session: Session) {
  if (session?.user?.id !== input.userId) {
    throw new Error("Unauthorized");
  }

  if (!session) {
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

export async function deleteChat(chatId: string) {
  await prisma.chat.delete({
    where: {
      id: chatId,
    },
  });

  revalidatePath("/chat");
}
