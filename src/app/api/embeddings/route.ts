import { getPresignedUrl } from "@/lib/cloudFlareClient";
import { createEmbedding } from "@/lib/openAiClient";
import { pineconeIndex } from "@/lib/pineconeClient";
import { prisma } from "@/lib/prisma";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { NextResponse } from "next/server";
import fetch from "node-fetch";

interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    fileName: string;
    pageNumber: number;
  };
}

export type Result = {
  text: string;
  fileName: string;
  pageNumber: number;
  score: number;
};

async function downloadPDFFromPresignedUrl(
  presignedUrl: string,
): Promise<Blob> {
  const response = await fetch(presignedUrl);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Blob([arrayBuffer], { type: "application/pdf" });
}

async function processPDFIntoChunks(
  fileName: string,
): Promise<DocumentChunk[]> {
  // Get pre-signed URL and download PDF
  const presignedUrl = await getPresignedUrl(fileName);
  if (!presignedUrl) {
    throw new Error("Failed to generate pre-signed URL");
  }

  const pdfBlob = await downloadPDFFromPresignedUrl(presignedUrl);

  // Load and parse PDF
  const loader = new WebPDFLoader(pdfBlob, {
    splitPages: true,
    parsedItemSeparator: "",
  });
  const documents = await loader.load();

  // Split into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await textSplitter.splitDocuments(documents);

  // Format chunks for processing
  return chunks.map((chunk, index) => ({
    id: `${fileName}-chunk-${index}`,
    text: chunk.pageContent.replace(/\n/g, " "),
    metadata: {
      fileName: fileName,
      pageNumber: chunk.metadata.pageNumber || 0,
    },
  }));
}

export async function POST(request: Request) {
  try {
    const { fileName } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 },
      );
    }

    // Process PDF into chunks
    const chunks = await processPDFIntoChunks(fileName);

    const upsertPromises = chunks.map(async (chunk) => {
      const embedding = await createEmbedding(chunk.text);
      return pineconeIndex.namespace("documents").upsert([
        {
          id: chunk.id,
          values: embedding,
          metadata: {
            text: chunk.text,
            fileName: chunk.metadata.fileName,
            pageNumber: chunk.metadata.pageNumber,
          },
        },
      ]);
    });

    await Promise.all(upsertPromises);

    const courseMaterial = await prisma.courseMaterial.findFirst({
      where: {
        fileName: fileName,
      },
    });

    if (!courseMaterial) {
      return NextResponse.json(
        { error: "Course material not found" },
        { status: 404 },
      );
    }

    await prisma.courseMaterial.update({
      where: {
        id: courseMaterial.id,
      },
      data: {
        documentIds: {
          set: chunks.map((chunk) => chunk.id),
        },
        isIndexed: true,
      },
    });

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 },
      );
    }

    // Generate embedding for the query
    const queryEmbedding = await createEmbedding(query);

    // Prepare search options
    const searchOptions = {
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    };

    // Search in Pinecone
    const results = await pineconeIndex
      .namespace("documents")
      .query(searchOptions);

    // Format results
    const formattedResults = results.matches.map((match) => ({
      text: match?.metadata?.text,
      fileName: match?.metadata?.fileName,
      pageNumber: match?.metadata?.pageNumber,
      score: match.score,
    }));

    // TODO: filter out non-fileName matches

    return NextResponse.json({
      results: formattedResults,
    });
  } catch (error) {
    console.error("Error searching documents:", error);
    return NextResponse.json(
      { error: "Failed to search documents" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("chatId");

    if (!id) {
      return NextResponse.json(
        { error: "ChatID parameter is required" },
        { status: 400 },
      );
    }

    const chat = await prisma.chat.findFirstOrThrow({
      where: {
        id: id,
      },
      include: {
        CourseMaterial: true,
      },
    });

    const documentIds = chat.CourseMaterial?.documentIds || [];
    // Delete one or many document(s) from Pinecone
    await pineconeIndex.namespace("documents").deleteMany(documentIds);
    return NextResponse.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 },
    );
  }
}
