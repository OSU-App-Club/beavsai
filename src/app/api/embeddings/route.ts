import { PdfRecord } from "@/lib/models";
import { deleteDocumentFromPinecone, queryDocuments } from "@/lib/pinecone";
import {
  handleEmbeddingAndStorage,
  processDocument,
  syncDocumentWithDb,
} from "@/lib/retrieval-augmentation-gen";
import { NextResponse } from "next/server";

/**
 * POST /api/embeddings
 * Processes a PDF file into chunks, embeds the text of each chunk, and stores the chunks in the Pinecone index.
 * @param request The incoming request.
 * @returns A response indicating the status of the operation.
 * @throws If an error occurs while processing the PDF.
 */
export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const args: PdfRecord = requestBody.data;
    if (!args.fileName)
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 },
      );

    const chunks = await processDocument(args);
    const [taskOne, taskTwo] = await Promise.allSettled([
      await handleEmbeddingAndStorage(chunks),
      await syncDocumentWithDb(args, chunks),
    ]);

    if (taskOne.status === "rejected" || taskTwo.status === "rejected") {
      return NextResponse.json(
        { error: "Failed to process PDF" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "PDF processed and stored successfully",
      chunks: chunks.length,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/embeddings
 * Searches for documents similar to the given query.
 * @param request The incoming request.
 * @returns A response containing the search results.
 * @throws If an error occurs while searching for documents.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    if (!query)
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 },
      );

    // Relevant chunks are stored in the Pinecone index
    const results = await queryDocuments(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error searching documents:", error);
    return NextResponse.json(
      { error: "Failed to search documents" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/embeddings
 * Deletes the documents associated with the given chat ID.
 * @param request The incoming request.
 * @returns A response indicating the status of the operation.
 * @throws If an error occurs while deleting the documents.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("chatId");
    if (!id)
      return NextResponse.json(
        { error: "ChatID parameter is required" },
        { status: 400 },
      );

    await deleteDocumentFromPinecone(id);

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 },
    );
  }
}
