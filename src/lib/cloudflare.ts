import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";

function checkEnvVariable(variableName: string) {
  if (!process.env[variableName]) {
    throw new Error(
      `Missing ${variableName}. Contact @Nyumat on Discord to get this value.`,
    );
  }
}

const requiredEnvVariables = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
];

requiredEnvVariables.forEach(checkEnvVariable);

/*
 * Cloudflare R2 (how we store files)
 * is just a wrapper around the AWS SDK for S3 (another way to store files)
 * so we can use the same SDK to interact with both.
 * (https://developers.cloudflare.com/r2/api/s3/api/)
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/*
 * This function generates a presigned URL for a file in Cloudflare R2
 * The URL is valid for 1 hour.
 * (https://developers.cloudflare.com/r2/api/s3/api/#getobject)
 */
export async function getPresignedUrl(fileName: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
  });
  try {
    const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error("Failed to generate presigned URL", error);
    throw new Error("Failed to generate presigned URL");
  }
}

/**
 * Loads a R2-stored PDF document from an authenticated presigned URL.
 * It returns a promise that resolves with the PDF as a Blob object.
 * This will be used to process the PDF into chunks.
 */
export async function loadDocumentFromURL(presignedUrl: string): Promise<Blob> {
  const response = await fetch(presignedUrl);
  if (!response.ok)
    throw new Error(`Failed to download PDF: ${response.statusText}`);

  const arrayBuffer = await response.arrayBuffer();
  return new Blob([arrayBuffer], { type: "application/pdf" });
}
