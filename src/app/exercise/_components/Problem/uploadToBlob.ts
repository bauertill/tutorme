export async function uploadToBlob(file: File): Promise<string> {
  // Upload image to Vercel Blob
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

  const result = await response.json();

  if (!result.success || !result.url) {
    throw new Error("Failed to upload image");
  }
  return result.url;
}
