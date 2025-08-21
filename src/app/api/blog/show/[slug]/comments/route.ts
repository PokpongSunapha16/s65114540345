import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function GET(req: Request) {
  try {
    // ✅ ดึง slug จาก URL
    const url = new URL(req.url);
    const slug = url.pathname.split("/")[4]; // /api/blog/show/[slug]/comments

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // ✅ ค้นหา Blog ID จาก slug
    const blog = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // ✅ ดึง Comment ของ Blog
    const comments = await prisma.blogComment.findMany({
      where: { blogId: blog.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true, // ✅ เพิ่ม `userId` เพื่อตรวจสอบเจ้าของคอมเมนต์
        author: {
          select: { id: true, username: true, profile_picture: true }, 
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("🚨 Error fetching comments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // ✅ ตรวจสอบ Token ของผู้ใช้
    const cookieStore = cookies();
    const token = (await cookieStore)?.get("token")?.value || "";

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    const userId = decoded.payload.id as number;

    // ✅ ดึง slug จาก URL
    const url = new URL(req.url);
    const slug = url.pathname.split("/")[4];

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // ✅ ค้นหา Blog ID จาก slug
    const blog = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // ✅ รับข้อมูลจาก Body
    const body = await req.json();
    const { content } = body;

    if (!content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // ✅ สร้าง Comment ใหม่
    const newComment = await prisma.blogComment.create({
      data: {
        blogId: blog.id,
        userId: userId, // ✅ ใช้ userId จาก token
        content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        author: { select: { id: true, username: true, profile_picture: true } },
      },
    });

    return NextResponse.json(newComment);
  } catch (error) {
    console.error("🚨 Error posting comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
