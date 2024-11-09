import { Pinecone } from "@pinecone-database/pinecone";
import { config } from "dotenv";
config({ path: ".env.local" });

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

type CourseMaterialMetadata = {
  title?: string;
  description?: string;
  userId?: string;
  fileId?: string;
  pageNumber?: number;
  fileName?: string;
  visibility?: string;
  text?: string;
};

const pineconeIndex = pinecone.index<CourseMaterialMetadata>(
  process.env.PINECONE_INDEX_NAME as string,
);

export { pineconeIndex };
