import { r2Client } from "@/lib/cloudFlareClient";
import { prisma } from "@/lib/prisma";
import { type PdfRecord } from "@/lib/types";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Uploads a PDF file to Cloudflare R2 and stores the metadata in our database.
 * @param fileBuffer The buffer of the PDF file to upload.
 * @param title The title of the PDF file.
 * @param description The description of the PDF file.
 * @returns Promise<PdfRecord>
 */
export async function uploadPdfToR2(
  fileBuffer: ArrayBuffer,
  title?: string,
  description?: string,
): Promise<PdfRecord> {
  const fileName = `${crypto.randomUUID()}.pdf`;

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(fileBuffer),
    ContentType: "application/pdf",
  });

  await r2Client.send(uploadCommand);

  const fileUrl = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${fileName}`;

  const pdfRecord = await prisma.courseMaterial.create({
    data: {
      title: title || "Untitled PDF",
      fileName,
      fileUrl,
      description,
    },
  });

  return pdfRecord;
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
  });

  if (!pdfRecord) {
    throw new Error("PDF not found");
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: pdfRecord.fileName,
    }),
  );

  await prisma.courseMaterial.delete({ where: { id: fileId } });
}
