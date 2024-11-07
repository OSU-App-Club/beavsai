"use server";

import { auth } from "@/lib/auth";
import { deletePdfFromR2 } from "@/lib/pdfStorage";
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
