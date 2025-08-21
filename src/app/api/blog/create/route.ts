import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify"; // ✅ เพิ่ม slugify

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: Request) {
  try {
    // ✅ ตรวจสอบ Token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

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

    // ✅ รับค่าจาก Frontend
    const { title, content, category, picture } = await req.json();

    if (!title || !content || !category || !picture) {
      return NextResponse.json({ error: "Missing required fields, including picture" }, { status: 400 });
    }

    // ✅ ตรวจจับประเภทไฟล์รูปภาพจาก Base64
    const matches = picture.match(/^data:(image\/\w+);base64,/);
    if (!matches) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = picture.replace(/^data:image\/\w+;base64,/, "");

    // ✅ ใช้ slugify + UUID ป้องกัน slug ซ้ำกัน
    const slug = slugify(title, { lower: true, strict: true, locale: "th" }) + "-" + uuidv4().slice(0, 8);

    // ✅ บันทึกข้อมูลลงฐานข้อมูล
    const newBlog = await prisma.blog.create({
      data: {
        userId,
        title,
        slug,
        content,
        category,
        picture: base64Data,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, slug: newBlog.slug }, { status: 201 });
  } catch (error) {
    console.error("🚨 Error creating blog:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
