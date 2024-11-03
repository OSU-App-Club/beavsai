"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Menu,
  MessageSquare,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  content: string;
  sender: "user" | "ai";
  images?: string[];
};

export default function ChatPage() {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [chats, setChats] = useState([
    { id: 1, name: "Chat 1" },
    { id: 2, name: "Chat 2" },
    { id: 3, name: "Chat 3" },
  ]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hello! How can I assist you today?\nFeel free to ask me anything!",
      sender: "ai",
    },
    {
      id: 2,
      content:
        "Hi there!\nI have a question about multi-line messages.\nCan you show me how they look?",
      sender: "user",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [imageAttachments, setImageAttachments] = useState<File[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const files = [
    { id: 1, name: "Document 1.pdf" },
    { id: 2, name: "Spreadsheet.xlsx" },
    { id: 3, name: "Presentation.pptx" },
  ];

  useEffect(() => {
    setIsFileDialogOpen(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    if (editingMessageId !== null && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.setSelectionRange(
        editingContent.length,
        editingContent.length,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMessageId]);

  const scrollToBottom = () => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const bottomThreshold = 100; // pixels from bottom
      const isNearBottom =
        scrollHeight - scrollTop - clientHeight < bottomThreshold;
      setShowScrollButton(!isNearBottom);
      setIsAtBottom(isNearBottom);
    }
  };

  const scrollToTop = () => {
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartChat = () => {
    setIsFileDialogOpen(false);
    console.log("Starting chat with file:", selectedFile);
  };

  const handleNewChat = () => {
    setIsNewChatDialogOpen(true);
  };

  const handleCreateNewChat = () => {
    if (selectedFile) {
      const newChat = {
        id: chats.length + 1,
        name: `Chat ${chats.length + 1}`,
      };
      setChats([...chats, newChat]);
      setSelectedFile(null);
      setIsNewChatDialogOpen(false);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() || imageAttachments.length > 0) {
      const newMessage: Message = {
        id: messages.length + 1,
        content: inputMessage,
        sender: "user",
        images: imageAttachments.map((file) => URL.createObjectURL(file)),
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
      setImageAttachments([]);
    }
  };

  const handleDeleteChat = (chatId: number) => {
    setChats(chats.filter((chat) => chat.id !== chatId));
  };

  const handleEditMessage = (messageId: number, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    if (editingMessageId !== null) {
      setMessages(
        messages.map((m) =>
          m.id === editingMessageId ? { ...m, content: editingContent } : m,
        ),
      );
      setEditingMessageId(null);
      setEditingContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleImageAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageAttachments([...imageAttachments, ...Array.from(e.target.files)]);
    }
  };

  const removeImageAttachment = (index: number) => {
    setImageAttachments(imageAttachments.filter((_, i) => i !== index));
  };

  const ChatItem = ({ chat }: { chat: { id: number; name: string } }) => (
    <div className="flex items-center justify-between w-full py-2">
      <Button variant="ghost" className="w-full justify-start">
        <MessageSquare className="mr-2 h-4 w-4" />
        {chat.name}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDeleteChat(chat.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="hidden md:flex md:flex-col md:w-64 border-r">
        <div className="p-4 border-b">
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={handleNewChat}
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

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between lg:hidden">
          {" "}
          {/* Header is hidden on large view ports */}
          <h1 className="text-xl font-bold">Chat</h1>
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
                  onClick={handleNewChat}
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
        </header>

        <div className="relative flex-1 overflow-hidden">
          <ScrollArea
            ref={scrollAreaRef}
            className="h-full p-4"
            onScrollCapture={handleScroll}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
              >
                <div
                  className={`flex items-start ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={
                        message.sender === "user"
                          ? "/user-avatar.png"
                          : "/ai-avatar.png"
                      }
                    />
                    <AvatarFallback>
                      {message.sender === "user" ? "U" : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`mx-2 p-3 rounded-lg ${message.sender === "user" ? "bg-orange-500 text-primary" : "text-primary bg-neutral-800"}`}
                  >
                    {editingMessageId === message.id ? (
                      <div className="flex flex-col">
                        <Textarea
                          ref={editTextareaRef}
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="mb-2 bg-transparent text-inherit border-none focus:ring-0"
                          rows={editingContent.split("\n").length}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Check className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.content.split("\n").map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            {index < message.content.split("\n").length - 1 && (
                              <br />
                            )}
                          </React.Fragment>
                        ))}
                        {message.images && message.images.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.images.map((image, index) => (
                              <Image
                                key={index}
                                src={image}
                                width={100}
                                height={100}
                                alt={`Attachment ${index + 1}`}
                                className="max-w-[100px] max-h-[100px] rounded"
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {message.sender === "user" &&
                    editingMessageId !== message.id && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2"
                              onClick={() =>
                                handleEditMessage(message.id, message.content)
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
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

        <div className="p-4 border-t">
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
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 mr-2 min-h-[60px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
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
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a File for Context</DialogTitle>
            <DialogDescription>
              Choose a file to provide context for your chat. This will help
              tailor the conversation to your needs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">File</Label>
            <Select onValueChange={(value) => setSelectedFile(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a file" />
              </SelectTrigger>
              <SelectContent>
                {files.map((file) => (
                  <SelectItem key={file.id} value={file.name}>
                    {file.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleStartChat} disabled={!selectedFile}>
              Start Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chat</DialogTitle>
            <DialogDescription>
              Select a file to use as context for your new chat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">File</Label>
            <Select onValueChange={(value) => setSelectedFile(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a file" />
              </SelectTrigger>
              <SelectContent>
                {files.map((file) => (
                  <SelectItem key={file.id} value={file.name}>
                    {file.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateNewChat} disabled={!selectedFile}>
              Create Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
