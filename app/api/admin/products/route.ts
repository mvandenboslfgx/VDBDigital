import { NextResponse } from "next/server";
import { requireAdminOrOwner, validateCsrf } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string(),
  shortDescription: z.string().max(500).optional(),
  price: z.number().positive(),
  images: z.array(z.string()).default([]),
  stock: z.number().int().min(0).default(0),
  category: z.string().max(100).default(""),
  specifications: z.record(z.string(), z.string()).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
});

/** GET /api/admin/products — list all products (admin/owner) */
export async function GET() {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);

    const products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (e) {
    return handleApiError(e, "AdminProductsList");
  }
}

/** POST /api/admin/products — create product (admin/owner) */
export async function POST(request: Request) {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);
    if (!(await validateCsrf(request))) return safeJsonError("Invalid request", 403);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return safeJsonError("Invalid JSON", 400);
    }
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) return safeJsonError("Product with this slug already exists", 400);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription ?? null,
        price: data.price,
        images: data.images,
        stock: data.stock,
        category: data.category,
        specifications: data.specifications ?? {},
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    return handleApiError(e, "AdminProductsCreate");
  }
}
