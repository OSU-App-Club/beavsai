"use client";

import { Session } from "next-auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createChat } from "../actions";
import { NewChatDialog } from "./new-chat-dialog";
import { CourseMaterial } from "@prisma/client";

interface InitialChatFlowProps {
  files: CourseMaterial[];
  session: Session | null;
}

export function InitialChatFlow({ files, session }: InitialChatFlowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showNewChat] = useState(searchParams.get("new") === "true");
  const userId = session?.user?.id;

  const handleCreateChat = async (fileId?: string) => {
    try {
      if (!userId) {
        throw new Error("Unauthorized");
      }
      const chat = await createChat(
        {
          userId,
          fileId,
        },
        session,
      );

      if (!chat) {
        throw new Error("Failed to create chat");
      }
      const params = new URLSearchParams(searchParams);
      params.delete("new");
      router.push(`/chat/${chat.id}`);
      return chat;
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  return (
    <NewChatDialog
      files={files}
      open={showNewChat}
      onOpenChange={(open) => {
        if (!open) {
          const params = new URLSearchParams(searchParams);
          params.delete("new");
          router.replace(pathname);
        }
      }}
      onCreateChat={handleCreateChat}
    />
  );
}
