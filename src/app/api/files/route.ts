import { deletePdfFromR2 } from "@/lib/pdfStorage";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 30;

/**
 * Get all PDF files from R2 storage
 * @returns
 * @throws
 * - 500 if failed to fetch files
 * - 200 with list of files
 * @example
 * GET /api/files
 */
export async function GET() {
  try {
    const documents = await prisma.courseMaterial.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        uploadedAt: true,
      },
      orderBy: { uploadedAt: "desc" },
    });
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch files", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}

/**
 * Delete a PDF file from R2 storage
 * @param request
 * @returns
 * @throws
 * - 400 if file ID is not provided
 * - 500 if failed to delete file
 * - 200 if file is deleted successfully
 * @example
 * DELETE /api/files?id=123
 */
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get("id");
  if (!fileId) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  }
  try {
    await deletePdfFromR2(fileId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete file", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
