import { OpenAIEmbeddings } from "@langchain/openai";
import { config } from "dotenv";
import { OpenAI } from "openai";
config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

export const createEmbedding = async (text: string) => {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return embedding.data[0].embedding;
};
