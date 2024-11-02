import { NextResponse } from "next/server";
import { index } from "@/lib/pineconeClient"; // adjust the import path as needed
import { createEmbedding } from "@/lib/openAiClient"; // adjust the import path as needed

export async function POST(request: Request) {
  const { id, text } = await request.json();

  if (!id || !text) {
    return NextResponse.json({ error: "Missing id or text" }, { status: 400 });
  }

  // Generate the embedding
  const embedding = await createEmbedding(text);

  // Upsert the embedding into Pinecone
  await index
    .namespace("ns1")
    .upsert([{ id, values: embedding, metadata: { text } }]);

  return NextResponse.json({ message: "Embedding uploaded successfully" });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryText = searchParams.get("text");

  if (!queryText) {
    return NextResponse.json(
      { error: "Query text is required" },
      { status: 400 },
    );
  }

  // Generate the embedding for the query
  const queryVector = await createEmbedding(queryText);

  // Search for similar embeddings in Pinecone
  const response = await index.namespace("ns1").query({
    topK: 1,
    vector: queryVector,
    includeValues: true,
    includeMetadata: true,
  });
  return NextResponse.json(response.matches[0].metadata);
}
