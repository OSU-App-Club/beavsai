import { r2Client } from "@/lib/cloudflare";
import { type PdfRecord } from "@/lib/models";
import { prisma } from "@/lib/prisma";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { PDFDocument } from "pdf-lib";

/**
 * Utility function to get the number of pages in a PDF file.
 * @param fileBuffer The buffer of the PDF file.
 * @returns Promise<number>
 */
async function getPdfPageCount(fileBuffer: ArrayBuffer): Promise<number> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  return pdfDoc.getPageCount();
}

/**
 * Uploads a PDF file to Cloudflare R2 and stores the metadata in our database.
 * @param fileBuffer The buffer of the PDF file to upload.
 * @param title The title of the PDF file.
 * @param description The description of the PDF file.
 * @param userId The ID of the user uploading the file.
 * @returns Promise<PdfRecord>
 */
export async function uploadPdfToR2(
  fileBuffer: ArrayBuffer,
  visibility: "PUBLIC" | "PRIVATE",
  userId: string,
  title: string,
  description?: string,
): Promise<PdfRecord> {
  const fileName = `${title?.replace(/\s/g, "-")}-${Date.now()}.pdf`;
  const fileSize = fileBuffer.byteLength;
  const pages = await getPdfPageCount(fileBuffer);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { CourseMaterial: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const currentStorageUsage = user.CourseMaterial.reduce(
    (acc, material) => acc + material.fileSize,
    0,
  );

  if (currentStorageUsage + fileSize > user.storageLimit) {
    throw new Error("Storage limit exceeded");
  }

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(fileBuffer),
    ContentType: "application/pdf",
    Metadata: {
      title: title || "Untitled PDF",
      description: description || "",
      userId,
    },
  });

  await r2Client.send(uploadCommand);

  const fileUrl = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${fileName}`;

  await prisma.user.update({
    where: { id: userId },
    data: { storageUsed: currentStorageUsage + fileSize },
  });

  const pdfRecord = await prisma.courseMaterial.create({
    data: {
      title: title || "Untitled PDF",
      fileName,
      fileUrl,
      description,
      pages,
      fileSize,
      visibility,
      user: {
        connect: { id: userId },
      },
    },
  });

  const isOwner = pdfRecord.userId === userId;

  return { ...pdfRecord, isOwner };
}

/**
 * Deletes a PDF file from Cloudflare R2 and the metadata from our database.
 * @param fileId The ID of the PDF file to delete.
 * @throws Error if the PDF file is not found.
 * @returns Promise<void>
 */
export async function deletePdfFromR2(fileId: string): Promise<void> {
  const pdfRecord = await prisma.courseMaterial.findUnique({
    where: { id: fileId },
    include: { user: true },
  });

  if (!pdfRecord) {
    throw new Error("PDF not found");
  }

  if (!pdfRecord.user) {
    throw new Error("User not found");
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: pdfRecord.fileName,
    }),
  );

  await prisma.user.update({
    where: { id: pdfRecord.user.id },
    data: {
      storageUsed: {
        decrement: pdfRecord.fileSize,
      },
    },
  });

  if (pdfRecord.user.storageUsed < 0) {
    await prisma.user.update({
      where: { id: pdfRecord.user.id },
      data: {
        storageUsed: 0,
      },
    });
  }

  await prisma.courseMaterial.delete({ where: { id: fileId } });
}

/**
 * Calculate total number of files, total number of pages, average file size, and storage used by the user.
 * @param userId The ID of the user.
 * @returns Promise<{ totalFiles: number, totalPages: number, averageFileSize: number, storageUsed: number }>
 * @throws Error if the user is not found.
 */
export async function calculateUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { CourseMaterial: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const totalFiles = user.CourseMaterial.length;
  const totalPages = user.CourseMaterial.reduce(
    (acc, material) => acc + material.pages,
    0,
  );
  const averageFileSize =
    totalFiles > 0
      ? user.CourseMaterial.reduce(
          (acc, material) => acc + material.fileSize,
          0,
        ) / totalFiles
      : 0;

  return {
    totalFiles,
    totalPages,
    averageFileSize,
    storageUsed: user.storageUsed,
  };
}
