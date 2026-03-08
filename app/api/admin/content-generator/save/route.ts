import { NextResponse } from "next/server";
import { requireAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_SLUGS } from "@/lib/kennisbank-categories";

export const runtime = "nodejs";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const user = await requireAdminOrOwner();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      title: string;
      slug?: string;
      content: string;
      category: string;
      seoTitle?: string;
      seoDescription?: string;
      publish?: boolean;
    };

    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();
    const category = String(body.category ?? "seo").trim();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Titel en content zijn verplicht." },
        { status: 400 }
      );
    }

    const slug = body.slug?.trim() ? slugify(body.slug) : slugify(title);
    if (!slug) {
      return NextResponse.json(
        { error: "Slug kon niet worden gegenereerd uit de titel." },
        { status: 400 }
      );
    }

    if (CATEGORY_SLUGS.includes(slug as (typeof CATEGORY_SLUGS)[number])) {
      return NextResponse.json(
        { error: "Deze slug is gereserveerd voor een categoriepagina." },
        { status: 400 }
      );
    }

    const categorySlug = CATEGORY_SLUGS.includes(category as (typeof CATEGORY_SLUGS)[number])
      ? category
      : "seo";

    const existing = await prisma.article.findUnique({ where: { slug } });
    const publishedAt = body.publish ? new Date() : null;

    if (existing) {
      await prisma.article.update({
        where: { slug },
        data: {
          title,
          content,
          category: categorySlug,
          seoTitle: body.seoTitle?.trim().slice(0, 100) ?? null,
          seoDescription: body.seoDescription?.trim().slice(0, 500) ?? null,
          publishedAt: publishedAt ?? existing.publishedAt,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, slug, updated: true });
    }

    await prisma.article.create({
      data: {
        title,
        slug,
        content,
        category: categorySlug,
        author: "VDB Digital",
        seoTitle: body.seoTitle?.trim().slice(0, 100) ?? null,
        seoDescription: body.seoDescription?.trim().slice(0, 500) ?? null,
        publishedAt,
      },
    });
    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error("[content-generator/save]", err);
    return NextResponse.json(
      { error: "Opslaan mislukt." },
      { status: 500 }
    );
  }
}
