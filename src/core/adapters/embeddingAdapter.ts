import { OpenAIEmbeddings } from "@langchain/openai";

const EMBEDDING_MODEL = "text-embedding-3-large";

export class EmbeddingAdapter {
  private embeddingModel: OpenAIEmbeddings;

  constructor() {
    this.embeddingModel = new OpenAIEmbeddings({
      modelName: EMBEDDING_MODEL,
    });
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return this.embeddingModel.embedDocuments(documents);
  }

  async embedQuery(query: string): Promise<number[]> {
    return this.embeddingModel.embedQuery(query);
  }
}

export const embeddingAdapter = new EmbeddingAdapter();
