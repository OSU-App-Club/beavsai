import { Pinecone } from "@pinecone-database/pinecone";
import { Result, type CourseMaterialMetadata } from "./models";
import { createEmbedding } from "./openai";
import { prisma } from "./prisma";

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

export const pineconeIndex = pinecone.index<CourseMaterialMetadata>(
  process.env.PINECONE_INDEX_NAME as string,
);

/**
 * Function to query documents using Pinecone.
 * Top 5 documents are returned.
 * @param query The query string to search for.
 * @returns A promise that resolves with the query results.
 */
export async function queryDocuments(query: string): Promise<Result[]> {
  try {
    const queryEmbedding = await createEmbedding(query);

    const results = await pineconeIndex.namespace("documents").query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    console.log({ results });

    const formattedResults = results.matches.map((match) => ({
      text: match?.metadata?.text,
      fileName: match?.metadata?.fileName,
      pageNumber: match?.metadata?.pageNumber,
      score: match.score,
    })) as Result[];

    return formattedResults;
  } catch (error) {
    console.error("Error searching documents:", error);
    throw new Error("Failed to search documents");
  }
}

/**
 * Function to delete a document from Pinecone.
 * @param id The ID of the chat where the document is stored.
 * @param session The current client's session.
 * @returns A promise that resolves when the document is deleted.
 */
export async function deleteDocumentFromPinecone(id: string): Promise<void> {
  try {
    const chat = await prisma.chat.findFirstOrThrow({
      where: { id },
      include: { CourseMaterial: true },
    });
    const documentIds = chat.CourseMaterial?.documentIds || [];
    await pineconeIndex.namespace("documents").deleteMany(documentIds);
  } catch (error) {
    console.error("Error deleting documents:", error);
    throw new Error("Failed to delete documents");
  }
}
