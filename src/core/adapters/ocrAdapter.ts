
import { Mistral } from '@mistralai/mistralai';
export class OCRAdapter {

    private client: Mistral;

    constructor() {
        const apiKey = process.env.MISTRAL_API_KEY;
        this.client = new Mistral({apiKey: apiKey});
    }

    


  async extractTextFromImage(imagePath: string): Promise<string> {
    const ocrResponse = await this.client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
            type: "image_url",
            imageUrl: imagePath,
        }
    });
    console.log(ocrResponse);
    return ""
  }
}

export const ocrAdapter = new OCRAdapter();