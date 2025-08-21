import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose"; 
import prisma from "@/lib/prisma";

export async function GET(req: Request, context: any) {
  try {
    const { slug } = context.params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // ✅ ดึง JWT Token จาก Cookie
    const token = (await cookies()).get("token")?.value;
    let loggedInUserId: number | null = null;

    if (token) {
      try {
        const secretKey = new TextEncoder().encode("your-secret-key");
        const { payload } = await jwtVerify(token, secretKey);
        loggedInUserId = Number(payload.id); // ✅ ใช้ `id` ตาม JWT Payload
        console.log("✅ Decoded Payload:", payload);
        console.log("✅ User Authenticated:", loggedInUserId);
      } catch (err) {
        console.error("🚨 Invalid Token:", err);
      }
    }

    // ✅ ดึงข้อมูลบล็อก (รวม `picture` และ `author.profile_picture`)
    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        picture: true, // ✅ เพิ่มรูปภาพของบล็อก
        userId: true,
        createdAt: true,  // ✅ เพิ่มวันที่สร้าง
        updatedAt: true,  // ✅ เพิ่มวันที่อัปเดต
        author: {
          select: {
            id: true,
            username: true,
            profile_picture: true, // ✅ เพิ่มรูปของผู้เขียน
          },
        },
      },
    });
    

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // ✅ ตรวจสอบว่าผู้ใช้ที่ล็อกอินเป็นเจ้าของบล็อกหรือไม่
    const isOwner = loggedInUserId !== null && blog.userId === loggedInUserId;

    return NextResponse.json({ ...blog, isOwner });
  } catch (error) {
    console.error("🚨 Error fetching blog:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
