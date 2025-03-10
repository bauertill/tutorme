import { env } from "@/env";
import { Mistral } from "@mistralai/mistralai";
export class OCRAdapter {
  private client: Mistral;

  constructor() {
    this.client = new Mistral({ apiKey: env.MISTRAL_API_KEY });
  }

  async extractMarkdownFromImage(imagePath: string): Promise<string> {
    const ocrResponse = await this.client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "image_url",
        imageUrl: imagePath,
      },
    });
    return ocrResponse.pages.map(({ markdown }) => markdown).join("\n");
  }
}

export const ocrAdapter = new OCRAdapter();
