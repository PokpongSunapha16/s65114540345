import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: any
) {

  try {
    const { category } = await params

    const blogs = await prisma.blog.findMany({
      where: { category: category },
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
