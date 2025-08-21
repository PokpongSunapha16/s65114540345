import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function GET() {
  try {
    const announcement = await prisma.announcement.findFirst({
      orderBy: { updatedAt: "desc" }, // ✅ ดึงประกาศล่าสุด
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { content } = await req.json();
    if (!content) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

    // ✅ ลบประกาศเก่าทั้งหมด
    await prisma.announcement.deleteMany();

    // ✅ เพิ่มประกาศใหม่
    const newAnnouncement = await prisma.announcement.create({
      data: { content },
    });

    return NextResponse.json(newAnnouncement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
