import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { BlogCategory } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params;

    // ✅ mapping frontend string -> Prisma enum
    const categoryMap: Record<string, BlogCategory> = {
      basketball: "BASKETBALL",
      health: "HEALTH",
      general: "GENERAL",
    };

    if (!categoryMap[category]) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const blogs = await prisma.blog.findMany({
      where: { category: categoryMap[category] },
      select: {
        id: true,
        title: true,
        slug: true,
        picture: true,
        createdAt: true,
        author: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("🚨 Error fetching blogs by category:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
