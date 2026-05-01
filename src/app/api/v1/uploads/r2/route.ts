import type { NextRequest } from "next/server";
import { z } from "zod";

import { isR2UploadConfigured, presignR2Upload } from "@/lib/public-api/r2-upload";
import { runPublicApi } from "@/lib/public-api/handler";
import { assertUploadRateLimit } from "@/lib/public-api/rate-limit-request";
import { ValidationError } from "@/lib/utils/errors";
import { jsonSuccess } from "@/lib/utils/response";

const uploadBodySchema = z.object({
  content_type: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ]),
  filename: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  return runPublicApi(request, async (ctx) => {
    if (!isR2UploadConfigured()) {
      throw new ValidationError("File uploads are not configured on this server");
    }

    await assertUploadRateLimit(request);

    const body = uploadBodySchema.parse(await request.json());
    const { uploadUrl, publicUrl, key } = await presignR2Upload({
      projectId: ctx.project.id,
      contentType: body.content_type,
      filename: body.filename,
    });

    return jsonSuccess({
      upload_url: uploadUrl,
      public_url: publicUrl,
      key,
    });
  });
}
