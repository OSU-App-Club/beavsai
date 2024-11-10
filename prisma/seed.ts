import { r2Client } from "@/lib/cloudflare";
import { prisma } from "@/lib/prisma";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PDFDocument } from "pdf-lib";
import { Readable } from "stream";

async function main() {
  try {
    const listParams = {
      Bucket: process.env.R2_BUCKET_NAME!,
    };

    const data = await r2Client.send(new ListObjectsV2Command(listParams));

    if (!data.Contents) {
      console.log("No PDFs found in the bucket.");
      return;
    }

    for (const obj of data.Contents) {
      if (!obj.Key || !obj.Key.endsWith(".pdf")) continue;

      const fileName = obj.Key;
      const getObjectParams = {
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileName,
      };

      const pdfData = await r2Client.send(
        new GetObjectCommand(getObjectParams),
      );
      let pages = 0;

      if (pdfData.Body) {
        const stream = pdfData.Body as Readable;
        const chunks: Uint8Array[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        const pdfBuffer = Buffer.concat(chunks);
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        pages = pdfDoc.getPageCount();
      }

      const fileUrl = await getSignedUrl(
        r2Client,
        new GetObjectCommand(getObjectParams),
        { expiresIn: 3600 * 24 * 365 },
      );

      const uploadedAt = obj.LastModified || new Date();
      const fileSize = obj.Size || 0;
      const visibility = "PUBLIC";

      await prisma.courseMaterial.create({
        data: {
          title: fileName,
          fileName: obj.Key,
          fileUrl,
          uploadedAt,
          fileSize,
          pages,
          visibility,
        },
      });

      console.log(`Inserted ${fileName}`);
    }
  } catch (error) {
    console.error("Error seeding CourseMaterial:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
