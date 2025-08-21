import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // ดึงข้อมูลบล็อกทั้งหมดจาก database
    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        picture: true, // ✅ เพิ่มการดึงรูปภาพ
      },
    });

    // สุ่ม 4 บล็อกจากรายการบล็อกทั้งหมด
    const shuffledBlogs = blogs.sort(() => 0.5 - Math.random()).slice(0, 4);

    return NextResponse.json(shuffledBlogs, { status: 200 });
  } catch (error) {
    console.error("🚨 Error fetching home random blogs:", error);
    return NextResponse.json({ error: "Failed to fetch home random blogs" }, { status: 500 });
  }
}
