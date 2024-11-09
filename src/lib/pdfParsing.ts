/**
 * This file is just an example of how we can use the Cloudflare API to download a PDF file and parse it.
 *
 * These methods CAN be used in the project, but it's meant primarily for testing/example purposes.
 */
import { getPresignedUrl } from "@/lib/cloudFlareClient";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import fetch from "node-fetch";

export async function downloadPDFFromPresignedUrl(
  presignedUrl: string,
): Promise<Blob> {
  try {
    const response = await fetch(presignedUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: "application/pdf" });
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw error;
  }
}

export async function loadPDFDocument(fileName: string) {
  try {
    // Get pre-signed URL
    const presignedUrl = await getPresignedUrl(fileName);
    if (!presignedUrl) {
      throw new Error("Failed to generate pre-signed URL");
    }

    // Download and convert to blob
    const pdfBlob = await downloadPDFFromPresignedUrl(presignedUrl);

    // Initialize PDF loader
    const loader = new WebPDFLoader(pdfBlob, {
      splitPages: true,
      parsedItemSeparator: "",
    });

    // Load and parse document
    const document = await loader.load();
    return document;
  } catch (error) {
    console.error("Error loading PDF document:", error);
    throw error;
  }
}

async function main() {
  try {
    const fileName = "A-second-document-1731046864461.pdf";
    const documents = await loadPDFDocument(fileName);
    console.log(documents);
  } catch (error) {
    console.error("Main process failed:", error);
    process.exit(1);
  }
}

main();
