"use server";

import { deletePdfFromR2 } from "@/lib/pdfStorage";
import { revalidatePath } from "next/cache";

/**
 * Deletes a file from the storage and revalidates the /files page.
 * @param fileId - The ID of the file to delete.
 * @returns A promise that resolves when the file is deleted.
 * @throws An error if the file cannot be deleted.
 * @see (https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
 */
export async function deleteFile(fileId: string): Promise<void> {
  await deletePdfFromR2(fileId);
  revalidatePath("/files");
}
