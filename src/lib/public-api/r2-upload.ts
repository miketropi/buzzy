import { randomUUID } from "node:crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function isR2UploadConfigured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET?.trim() &&
      process.env.R2_PUBLIC_URL?.trim(),
  );
}

function r2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID!;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

/** Presign PUT for direct browser upload to R2 (S3-compatible). */
export async function presignR2Upload(options: {
  projectId: string;
  contentType: string;
  filename?: string;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const bucket = process.env.R2_BUCKET!;
  const publicBase = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  const ext = options.filename?.includes(".") ? options.filename.slice(options.filename.lastIndexOf(".")) : "";
  const key = `buzzy/${options.projectId}/${randomUUID()}${ext || guessExt(options.contentType)}`;
  const client = r2Client();
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: options.contentType,
  });
  const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 900 });
  const publicUrl = `${publicBase}/${key}`;
  return { uploadUrl, publicUrl, key };
}

function guessExt(ct: string): string {
  if (ct === "image/jpeg") return ".jpg";
  if (ct === "image/png") return ".png";
  if (ct === "image/webp") return ".webp";
  if (ct === "image/gif") return ".gif";
  if (ct === "video/mp4") return ".mp4";
  if (ct === "video/webm") return ".webm";
  if (ct === "video/quicktime") return ".mov";
  if (ct === "application/pdf") return ".pdf";
  if (ct === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return ".docx";
  if (ct === "application/msword") return ".doc";
  return "";
}
