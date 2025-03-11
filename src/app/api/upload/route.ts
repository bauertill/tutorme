import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    const fileExtension = file.name.split(".").pop() ?? "";
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    const blob = await put(uniqueFilename, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error("Error uploading file to Vercel Blob:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 },
    );
  }
}
