import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const kind = clientPayload === "video" ? "video" : "image";
        return {
          allowedContentTypes:
            kind === "video" ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES,
          addRandomSuffix: true,
          maximumSizeInBytes: kind === "video" ? 100 * 1024 * 1024 : 10 * 1024 * 1024,
          tokenPayload: JSON.stringify({ kind }),
        };
      },
      onUploadCompleted: async () => {
        // No-op: the client attaches the resulting URL to the product form itself.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al subir el archivo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
