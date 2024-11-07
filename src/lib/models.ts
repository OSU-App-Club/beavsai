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
};

export type UserStats = {
  totalFiles: number;
  totalPages: number;
  averageFileSize: number;
  storageUsed: number;
};
