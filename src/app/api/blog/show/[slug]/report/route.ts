import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: Request, context: any) {
  try {
    // ✅ ใช้ await กับ context.params
    const { slug } = await context.params;
    const { reason, details } = await req.json();

    if (!slug || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ ตรวจสอบ ENUM
    const validReasons = ["RUDE", "SEXUAL", "VIOLENT", "THREATEN"];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: "Invalid report reason" }, { status: 400 });
    }

    // ✅ ดึงข้อมูล Blog ID จาก slug
    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // ✅ ตรวจสอบ JWT Token
    const token = (await cookies()).get("token")?.value;
    let userId: number | null = null;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET);
        userId = Number(payload.id);
      } catch (error) {
        console.error("🚨 Invalid Token:", error);
      }
    }

    // ✅ บันทึกการรายงานลง Database
    const report = await prisma.report.create({
      data: {
        blogId: blog.id,
        userId: userId || null, // ถ้าไม่ได้ล็อกอินให้เป็น null
        reason,
        details: details || "",
      },
    });

    return NextResponse.json({ message: "Report submitted successfully", report });
  } catch (error) {
    console.error("🚨 Error submitting report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
