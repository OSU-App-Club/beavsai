import { OpenAI } from "openai";
import { config } from "dotenv";
config();

console.log(process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export const createEmbedding = async (text: string) => {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return embedding.data[0].embedding;
};
