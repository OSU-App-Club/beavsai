/*
 * This is the route file for the PDF upload API endpoint.
 * It receives a PDF file and uploads it to Cloudflare R2.
 * https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 */
import { uploadPdfToR2 } from "@/lib/pdfStorage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  // Extract the file, title, and description from the form data
  const file = formData.get("file") as Blob;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  // Convert the file to an easily uploadable format
  const fileBuffer = await file.arrayBuffer();

  try {
    // Upload the PDF to R2 and store the metadata in the database
    const pdfRecord = await uploadPdfToR2(fileBuffer, title, description);

    return NextResponse.json({ message: "Upload successful", pdf: pdfRecord });
  } catch (error) {
    // Something bad happened during the upload?
    console.error("Failed to upload PDF", error);
    return NextResponse.json(
      { error: "Failed to upload PDF", details: error },
      { status: 500 },
    );
  }
}
