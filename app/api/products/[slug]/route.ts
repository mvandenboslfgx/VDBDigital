import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/apiSafeResponse";

/**
 * GET /api/products/[slug] — get product by slug (public, for storefront).
 * Returns 404 if not found or out of stock can be handled by caller.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (e) {
    return handleApiError(e, "ProductsGetBySlug");
  }
}
