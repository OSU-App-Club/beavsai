/*
 * This is the route file for the PDF upload API endpoint.
 * It receives a PDF file and uploads it to Cloudflare R2.
 * https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 */
import { uploadPdf } from "@/app/files/actions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  // Extract the file, title, and description from the form data
  const file = formData.get("file") as Blob;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const visibility = formData.get("visibility") as "PUBLIC" | "PRIVATE";
  // Convert the file to an easily uploadable format
  const fileBuffer = await file.arrayBuffer();
  const fields = {
    title,
    description,
    visibility,
  };
  try {
    // Trigger server action
    const pdfRecord = await uploadPdf({
      fileBuffer,
      formData: fields,
    });
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
