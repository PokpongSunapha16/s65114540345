import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

// ✅ GET: ดึงประกาศ 3 รายการล่าสุด
export async function GET() {
  try {
    const announcements = await prisma.featuredAnnouncement.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching featured announcements:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST: เพิ่มหรืออัปเดตประกาศ
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id, title, image, linkUrl, details } = await req.json();
    if (!title || !image || !linkUrl) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

    let updatedAnnouncement;
    if (id) {
      updatedAnnouncement = await prisma.featuredAnnouncement.update({
        where: { id },
        data: { title, image, linkUrl, details }, // ✅ อัปเดต image ด้วย
      });
    } else {
      const count = await prisma.featuredAnnouncement.count();
      if (count >= 3) {
        const oldest = await prisma.featuredAnnouncement.findFirst({ orderBy: { createdAt: "asc" } });
        if (oldest) {
          await prisma.featuredAnnouncement.delete({ where: { id: oldest.id } });
        }
      }
      updatedAnnouncement = await prisma.featuredAnnouncement.create({
        data: { title, image, linkUrl, details }, // ✅ เพิ่ม image ลงในข้อมูลใหม่
      });
    }

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error("Error creating/updating featured announcement:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
      const { id } = await req.json(); // รับ `id` จาก request body
  
      if (!id) {
        return NextResponse.json({ error: 'ต้องระบุ ID ของประกาศที่ต้องการลบ' }, { status: 400 });
      }
  
      await prisma.featuredAnnouncement.delete({
        where: { id },
      });
  
      return NextResponse.json({ message: 'ลบประกาศเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('🚨 Error deleting featured announcement:', error);
      return NextResponse.json({ error: 'ไม่สามารถลบประกาศได้' }, { status: 500 });
    }
  }
