import { put, del } from "@vercel/blob";

export type BlobCategory =
  | "cv"
  | "proposal"
  | "payment-proof"
  | "article-cover"
  | "consultant-photo"
  | "partner-logo"
  | "payment-method-logo";

/** Upload a file to Vercel Blob and return its public URL */
export async function uploadToBlob(
  file: File | Blob,
  filename: string,
  category: BlobCategory
): Promise<string> {
  const pathname = `${category}/${Date.now()}-${filename}`;
  const { url } = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });
  return url;
}

/** Delete a file from Vercel Blob by URL */
export async function deleteFromBlob(url: string): Promise<void> {
  await del(url);
}
