import { z } from "zod";

const BlobResponse = z.object({
  success: z.boolean(),
  url: z.string(),
});
export async function uploadToBlob(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    console.error(response);
    console.error(await response.json());
    throw new Error("Failed to upload image");
  }

  const result = BlobResponse.parse(await response.json());

  if (!result.success) throw new Error("Failed to upload image");
  return result.url;
}
