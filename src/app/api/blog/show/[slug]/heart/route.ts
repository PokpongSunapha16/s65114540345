import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function GET(req: Request, context: any) {
  try {
    // ✅ ใช้ context.params.slug และใช้ await
    const { params } = context;
    const slug = await params.slug;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true, hearts: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // ✅ ตรวจสอบว่าผู้ใช้กดหัวใจไว้หรือยัง
    const cookieStore = cookies();
    const token = (await cookieStore)?.get("token")?.value || "";

    let liked = false;
    if (token) {
      try {
        const decoded = await jwtVerify(token, SECRET);
        const userId = decoded.payload.id as number;

        const existingHeart = await prisma.heart.findFirst({
          where: { userId, blogId: blog.id },
        });

        liked = !!existingHeart;
      } catch (error) {
        console.warn("🔍 Token verification failed:", error);
      }
    }

    return NextResponse.json({ success: true, total: blog.hearts, liked });
  } catch (error) {
    console.error("🚨 Error fetching hearts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, context: any) {
  try {
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
    const { params } = context;
    const slug = await params.slug;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const existingHeart = await prisma.heart.findFirst({
      where: { userId, blogId: blog.id },
    });

    if (existingHeart) {
      // ลบหัวใจออก
      await prisma.heart.delete({
        where: { id: existingHeart.id },
      });
    } else {
      // เพิ่มหัวใจเข้าไป
      await prisma.heart.create({
        data: { userId, blogId: blog.id },
      });
    }

    // ✅ อัปเดตจำนวนหัวใจใน blog
    const totalHearts = await prisma.heart.count({
      where: { blogId: blog.id },
    });

    await prisma.blog.update({
      where: { id: blog.id },
      data: { hearts: totalHearts },
    });

    return NextResponse.json({ success: true, liked: !existingHeart, total: totalHearts });

  } catch (error) {
    console.error("🚨 Error liking post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
