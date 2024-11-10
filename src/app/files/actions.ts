"use server";

import { auth } from "@/lib/auth";
import { type PdfRecord, type UploadPDFAction } from "@/lib/models";
import { deletePdfFromR2, uploadPdfToR2 } from "@/lib/pdfStorage";
import { revalidatePath } from "next/cache";

/**
 * Delete a file from the R2 and revalidate the /files page.
 * @param fileId - The ID of the file to delete.
 * @returns A promise that resolves when the file is deleted.
 * @throws An error if the user is not authorized or the file ID is not provided.
 * @see (https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
 */
export async function deleteFile(fileId: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (!fileId) throw new Error("File ID is required");
  if (!session?.user?.id) throw new Error("User ID is required");
  await deletePdfFromR2(fileId);
  revalidatePath("/files");
}

export async function uploadPdf({
  fileBuffer,
  formData,
}: UploadPDFAction): Promise<PdfRecord> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (!session?.user?.id) throw new Error("User ID is required");

  const userId = session.user.id;
  const { title, description, visibility } = formData;

  try {
    const pdfRecord = await uploadPdfToR2(
      fileBuffer,
      visibility,
      userId,
      title,
      description,
    );

    return pdfRecord;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }

    throw new Error("Failed to upload PDF");
  }
}
