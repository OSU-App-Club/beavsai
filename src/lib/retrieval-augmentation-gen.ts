import {
  DocumentChunk,
  PdfRecord,
  type CreateMessageInput,
} from "@/lib/models";
import { prisma } from "@/lib/prisma";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { Message } from "ai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getPresignedUrl, loadDocumentFromURL } from "./cloudflare";
import { createEmbedding } from "./openai";
import { pineconeIndex, queryDocuments } from "./pinecone";

/**
 * Downloads a PDF from a pre-signed URL, splits the text into chunks, and returns parsed chunks.
 * @param fileName The name of the PDF file to process.
 * @returns A promise that resolves with the parsed document chunks.
 */
export async function processDocument(
  pdf: PdfRecord,
): Promise<DocumentChunk[]> {
  try {
    const presignedUrl = await getPresignedUrl(pdf.fileName);
    const pdfBlob = await loadDocumentFromURL(presignedUrl);
    const loader = new WebPDFLoader(pdfBlob, { splitPages: true });
    const documents = await loader.load();

    console.log({ documents });

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitDocuments(documents);

    return chunks.map((chunk, index) => ({
      id: `${pdf.fileName}-chunk-${index}`,
      text: chunk.pageContent.replace(/\n/g, " "),
      metadata: {
        ...pdf,
        pageNumber: chunk.metadata.pageNumber || 0,
      },
    }));
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw error;
  }
}

/**
 * Helper function to get the context of a file.
 * @param chatId The ID of the chat.
 * @returns The context as a string.
 */
export async function getFileContext(message: Message): Promise<string> {
  if (!message) return "";

  const results = await queryDocuments(message.content);

  return results.length > 0
    ? results.map((result) => result.text).join("\n")
    : "";
}

/**
 * Function to save the most recent user message and the assistant message in a transaction.
 * @param messages Array of messages.
 * @param chatId The ID of the chat.
 * @param text The content of the assistant message.
 */
export async function saveMessagesInTransaction({
  messages,
  chatId,
  text,
}: CreateMessageInput): Promise<void | Error> {
  try {
    const mostRecent = messages.findLast((message) => message.role === "user");

    await prisma.$transaction(async (prisma) => {
      if (mostRecent)
        await prisma.message.create({
          data: { chatId, content: mostRecent.content, role: "user" },
        });

      if (text)
        await prisma.message.create({
          data: { chatId, content: text, role: "assistant" },
        });
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("saveMessagesInTransaction Error:", error.message);
    }
  }
}

/**
 * Embeds the text of each chunk and stores it in the Pinecone index.
 * @param chunks The chunks to embed and store.
 * @returns A promise that resolves when all chunks have been embedded and stored.
 */
export async function handleEmbeddingAndStorage(chunks: DocumentChunk[]) {
  return Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await createEmbedding(chunk.text);
      await pineconeIndex.namespace("documents").upsert([
        {
          id: chunk.id,
          values: embedding,
          metadata: {
            id: chunk.id,
            text: chunk.text,
            ...chunk.metadata,
          },
        },
      ]);
    }),
  );
}

/**
 * Updates the course material record in the database with the pinecone document IDs.
 * @param args The PDF record.
 * @param chunks The document chunks.
 * @returns A promise that resolves when the course material record has been updated.
 */
export async function syncDocumentWithDb(
  args: PdfRecord,
  chunks: DocumentChunk[],
): Promise<void> {
  const courseMaterial = await prisma.courseMaterial.findFirst({
    where: { fileName: args.fileName },
  });

  if (!courseMaterial) throw new Error("Course material not found");

  await prisma.courseMaterial.update({
    where: { id: courseMaterial.id },
    data: {
      documentIds: { set: chunks.map((chunk) => chunk.id) },
      isIndexed: true,
    },
  });
}
