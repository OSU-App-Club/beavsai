"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Chat, CourseMaterial } from "@prisma/client";
import { Menu, MessageSquare, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteChat } from "../actions";
import { NewChatDialog } from "./new-chat-dialog";

interface ChatListProps {
  initialChats: Chat[];
  files: CourseMaterial[];
  onCreateChat: (fileId?: string) => Promise<Chat>;
}

export function ChatList({ initialChats, files, onCreateChat }: ChatListProps) {
  const [chats, setChats] = useState(initialChats);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteChat = async (chatId: string) => {
    try {
      setIsDeleting(chatId);

      const chatIndex = chats.findIndex((chat) => chat.id === chatId);
      const previousChat = chats[chatIndex - 1];

      await deleteChat(chatId);

      toast.success("Chat deleted successfully.");

      setChats(chats.filter((chat) => chat.id !== chatId));
      if (!previousChat) {
        router.push("/chat");
      } else {
        router.push(`/chat/${previousChat.id}`);
      }
    } catch (error) {
      setChats(initialChats);
      toast.error("Failed to delete chat");
      console.error("Error deleting chat:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const ChatItem = ({ chat }: { chat: Chat }) => (
    <div className="flex items-center justify-between w-full py-2">
      <Button
        variant="ghost"
        className="w-full justify-start ml-2"
        onClick={() => router.push(`/chat/${chat.id}`)}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        {chat.name || "New Chat"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting === chat.id}
            className="mr-2"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleDeleteChat(chat.id)}
            disabled={isDeleting === chat.id}
          >
            {isDeleting === chat.id ? (
              <span className="mr-2 h-4 w-4 animate-spin">●</span>
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-64 border-r">
        <div className="p-4 border-b">
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={() => setIsNewChatDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </ScrollArea>
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetTitle>Chats</SheetTitle>
          <div className="py-4">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setIsNewChatDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> New Chat
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {chats.map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <NewChatDialog
        files={files}
        open={isNewChatDialogOpen}
        onOpenChange={setIsNewChatDialogOpen}
        onCreateChat={onCreateChat}
      />
    </>
  );
}
