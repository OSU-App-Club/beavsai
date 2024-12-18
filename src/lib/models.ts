import { Message } from "ai";
import { z } from "zod";

export const pdfUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file: z
    .instanceof(File)
    .refine((file) => file && file.type === "application/pdf", {
      message: "Please upload a PDF file",
    })
    .nullable(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
});
export type PdfUploadFormData = z.infer<typeof pdfUploadSchema>;

export const createChatSchema = z.object({
  userId: z.string().uuid(),
  fileId: z.string().optional(),
  initialMessage: z.string().optional(),
});

export type CreateChatInput = z.infer<typeof createChatSchema>;

export type PdfRecord = {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  description: string | null;
  fileSize: number;
  uploadedAt: Date;
  visibility: "PUBLIC" | "PRIVATE";
  isOwner: boolean;
};

export type UserStats = {
  totalFiles: number;
  totalPages: number;
  averageFileSize: number;
  storageUsed: number;
};

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    fileName: string;
    pageNumber: number;
  };
}

export type Result = {
  text: string;
  fileName: string;
  pageNumber: number;
  score: number;
};

export type CourseMaterialMetadata = {
  title?: string;
  description?: string;
  userId?: string;
  fileId?: string;
  pageNumber?: number;
  fileName?: string;
  visibility?: string;
  text?: string;
  ownerEmailOrId?: string | undefined;
  id?: string;
};

export type UploadPDFAction = {
  fileBuffer: ArrayBuffer;
  formData: Omit<PdfUploadFormData, "file">;
};

export type CreateMessageInput = {
  messages: Message[];
  chatId: string;
  text?: string;
  fileId?: string;
};

export type CreateChatWithMsg = {
  userId: string;
  fileId?: string;
  initialMessage?: string;
  initMsgAIResponse?: string;
};
