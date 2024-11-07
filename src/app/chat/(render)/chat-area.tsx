"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Message } from "@prisma/client";
import { useChat } from "ai/react";
import { ChevronDown, ChevronUp, ImageIcon, Send, X } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface ChatAreaProps {
  chatId: string;
  initialMessage?: string;
  initialMessages: Message[];
  fileContext?: string | null;
  session: Session;
}

export function ChatArea({
  chatId,
  initialMessage,
  initialMessages,
  fileContext,
  session,
}: ChatAreaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome");

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      id: chatId,
      initialMessages: initialMessages
        .filter(
          (msg) => !(welcome === "true" && msg.content === initialMessage),
        )
        .map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as "user" | "assistant",
        })),
      body: {
        chatId,
        fileContext,
      },
    });

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [imageAttachments, setImageAttachments] = useState<File[]>([]);
  const [hasProcessedWelcome, setHasProcessedWelcome] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (welcome === "true" && initialMessage && !hasProcessedWelcome) {
      const simulateMessageSubmit = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fakeEvent = new Event("submit") as any;
        fakeEvent.preventDefault = () => {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleInputChange({ target: { value: initialMessage } } as any);
        await handleSubmit(fakeEvent);
        setHasProcessedWelcome(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("welcome");
        router.replace(url.toString());
      };

      simulateMessageSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcome, initialMessage, handleSubmit, handleInputChange, router]);

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const bottomThreshold = 100;
      const isNearBottom =
        scrollHeight - scrollTop - clientHeight < bottomThreshold;
      setShowScrollButton(!isNearBottom);
      setIsAtBottom(isNearBottom);
    }
  };

  const scrollToTop = () => {
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageAttachments([...imageAttachments, ...Array.from(e.target.files)]);
    }
  };

  const removeImageAttachment = (index: number) => {
    setImageAttachments(imageAttachments.filter((_, i) => i !== index));
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-full p-4"
          onScrollCapture={handleScroll}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mx-4 flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`flex items-start ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="w-8 h-8">
                  {session?.user?.image ? (
                    <AvatarImage
                      src={
                        message.role === "user"
                          ? session?.user?.image
                          : "/ai-avatar.png"
                      }
                    />
                  ) : (
                    <AvatarImage
                      src={
                        message.role === "user"
                          ? "https://api.dicebear.com/5.x/lorelei/png"
                          : "https://api.dicebear.com/5.x/bottts/webp"
                      }
                    />
                  )}
                  <AvatarFallback>
                    {message.role === "user" ? "U" : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`mx-2 p-3 rounded-lg max-w-lg ${
                    message.role === "user"
                      ? "bg-osu text-white dark:text-primary text-lg"
                      : "text-white dark:text-primary bg-neutral-800 text-lg"
                  }`}
                >
                  {message.content.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < message.content.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
        {showScrollButton && (
          <Button
            className="absolute bottom-4 right-4 rounded-full"
            size="icon"
            onClick={isAtBottom ? scrollToTop : scrollToBottom}
          >
            {isAtBottom ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex flex-col">
          {imageAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {imageAttachments.map((file, index) => (
                <div key={index} className="relative">
                  <Image
                    width={64}
                    height={64}
                    src={URL.createObjectURL(file)}
                    alt={`Attachment ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => removeImageAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              className="flex-1 mr-2 min-h-[60px] text-lg"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  handleSubmit(e as any);
                }
              }}
            />
            <div className="flex">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="mr-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageAttachment}
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
