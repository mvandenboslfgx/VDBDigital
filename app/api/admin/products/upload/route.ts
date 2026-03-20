import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createSecureRoute } from "@/lib/secureRoute";
import { safeJsonError } from "@/lib/apiSafeResponse";
import { adminProductUploadBodySchema } from "@/lib/validation";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/admin/products/upload
 * Upload image for product. Saves to public/products/ (works in dev/self-hosted).
 * On Vercel serverless, filesystem is read-only; use image URLs in product form or Vercel Blob.
 */
export const POST = createSecureRoute<{ file: File }, undefined>({
  auth: "admin",
  csrf: true,
  rateLimit: "admin",
  bodyMode: "formData",
  schema: adminProductUploadBodySchema,
  invalidInputMessage: "Invalid upload.",
  logContext: "Admin/Products/Upload",
  handler: async ({ input }) => {
    const file = input.file;

    // Belt-and-suspenders: schema already validates type/size.
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE) {
      return safeJsonError("Invalid file.", 400);
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
        {
          error: "Upload not available on this environment. Use image URLs or configure Vercel Blob.",
        },
        { status: 501 }
      );
    }

    const publicPath = `/products/${safeName}`;
    return NextResponse.json({ path: publicPath }, { status: 200 });
  },
});
