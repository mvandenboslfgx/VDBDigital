import { NextResponse } from "next/server";
import { requireAdminOrOwner, validateCsrf } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional().nullable(),
  price: z.number().positive().optional(),
  images: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  category: z.string().max(100).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
});

/** GET /api/admin/products/[id] — get one product (admin/owner) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);

    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return safeJsonError("Product not found", 404);
    return NextResponse.json(product);
  } catch (e) {
    return handleApiError(e, "AdminProductsGet");
  }
}

/** PUT /api/admin/products/[id] — update product (admin/owner) */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);

    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return safeJsonError("Product not found", 404);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return safeJsonError("Invalid JSON", 400);
    }
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.product.findUnique({ where: { slug: data.slug } });
      if (slugTaken) return safeJsonError("Slug already in use", 400);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.specifications !== undefined && { specifications: data.specifications }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    return handleApiError(e, "AdminProductsUpdate");
  }
}

/** DELETE /api/admin/products/[id] — delete product (admin/owner) */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdminOrOwner();
    if (!user) return safeJsonError("Unauthorized", 403);
    if (!(await validateCsrf(request))) return safeJsonError("Invalid request", 403);

    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025")
      return safeJsonError("Product not found", 404);
    return handleApiError(e, "AdminProductsDelete");
  }
}
