import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function PUT(req: Request, { params }:any) {
  try {
    const { slug } = params;

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const image = formData.get("image") as File | null;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

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

    // ✅ ตรวจสอบว่าผู้ใช้เป็นเจ้าของบล็อกหรือไม่
    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (blog.userId !== userId) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    let imageBase64 = null;
    if (image) {
      const buffer = await image.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString("base64");
    }

    // ✅ อัปเดตข้อมูลบล็อก
    await prisma.blog.update({
      where: { id: blog.id },
      data: { title, content, ...(imageBase64 && { picture: imageBase64 }) },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("🚨 Error updating blog:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
