import { NextResponse } from "next/server";
import { requireAdminOrOwner, validateCsrf } from "@/lib/auth";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/admin/products/upload
 * Upload image for product. Saves to public/products/ (works in dev/self-hosted).
 * On Vercel serverless, filesystem is read-only; use image URLs in product form or Vercel Blob.
 */
export async function POST(request: Request) {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);
    if (!(await validateCsrf(request))) return safeJsonError("Invalid request", 403);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return safeJsonError("Missing or invalid file", 400);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return safeJsonError("Invalid file type. Use JPEG, PNG, WebP or GIF.", 400);
    }
    if (file.size > MAX_SIZE) {
      return safeJsonError("File too large (max 5MB)", 400);
    }

    const ext = path.extname(file.name) || ".jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const dir = path.join(process.cwd(), "public", "products");
    const filePath = path.join(dir, safeName);

    try {
      await mkdir(dir, { recursive: true });
      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));
    } catch (err) {
      console.error("[Product upload] Write failed:", err);
      return NextResponse.json(
        { error: "Upload not available on this environment. Use image URLs or configure Vercel Blob." },
        { status: 501 }
      );
    }

    const publicPath = `/products/${safeName}`;
    return NextResponse.json({ path: publicPath });
  } catch (e) {
    return handleApiError(e, "AdminProductsUpload");
  }
}
