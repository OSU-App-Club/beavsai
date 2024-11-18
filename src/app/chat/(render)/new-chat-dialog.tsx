"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Chat, CourseMaterial } from "@prisma/client";
import { FileQuestion, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface NewChatDialogProps {
  files: CourseMaterial[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateChat: (fileId?: string) => Promise<Chat | undefined>;
}

export function NewChatDialog({
  files,
  open,
  onOpenChange,
  onCreateChat,
}: NewChatDialogProps) {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleStartInstantChat = async () => {
    try {
      setIsCreating(true);
      const chat = await onCreateChat(); // NOTE: No fileId for instant chat!
      onOpenChange(false);
      if (!chat) {
        throw new Error("Failed to create chat");
      }
      router.push(`/chat/${chat.id}`);
    } catch {
      toast.error("Failed to create chat");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartWithFile = async () => {
    if (selectedFile && !isCreating) {
      try {
        setIsCreating(true);
        const chat = await onCreateChat(selectedFile);
        if (!chat) {
          throw new Error("Failed to create chat");
        }
        setIsFileDialogOpen(false);
        onOpenChange(false);
        router.push(`/chat/${chat.id}`);
      } catch (error) {
        console.error("Failed to create chat with file:", error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <>
      <Dialog open={open && !isFileDialogOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a New Chat</DialogTitle>
            <DialogDescription>
              Choose how you&apos;d like to start your conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={handleStartInstantChat}
              disabled={isCreating}
            >
              <MessageSquare className="h-8 w-8" />
              <div className="text-sm">Start Instant Chat</div>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setIsFileDialogOpen(true)}
              disabled={isCreating}
            >
              <FileQuestion className="h-8 w-8" />
              <div className="text-sm">Chat with File Context</div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isFileDialogOpen}
        onOpenChange={(open) => {
          setIsFileDialogOpen(open);
          if (!open) {
            setSelectedFile(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select File for Context</DialogTitle>
            <DialogDescription>
              Choose a file to provide context for your chat.
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
                  <SelectItem key={file.id} value={file.id}>
                    {file.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setIsFileDialogOpen(false)}>
              Back
            </Button>
            <Button
              onClick={handleStartWithFile}
              disabled={!selectedFile || isCreating}
            >
              {isCreating ? "Creating..." : "Start Chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
