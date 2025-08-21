import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

// ✅ METHOD: GET -> ดึงข้อมูลผู้ใช้งานทั้งหมดพร้อมแกลลอรี่
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const searchQuery = searchParams.get("search") || "";

    // ✅ ค้นหาผู้ใช้ตาม username และดึงรูปภาพทั้งหมด
    const usersWithGallery = await prisma.user.findMany({
      where: {
        username: {
          contains: searchQuery,
        },
      },
      select: {
        id: true,
        username: true,
        district: true,
        position: true,
        note: true,
        galleries: {
          select: {
            id: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(usersWithGallery, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching users with gallery:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ METHOD: DELETE -> ใช้ลบสมาชิก หรือ ลบรูปภาพของผู้ใช้ (เฉพาะ ADMIN เท่านั้น)
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ ตรวจสอบ JWT Token และสิทธิ์ Admin
    const { payload } = await jwtVerify(token, SECRET);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only ADMIN can delete" }, { status: 403 });
    }

    const { userId, imageId } = await req.json();

    if (userId) {
      // ✅ ตรวจสอบว่าไม่ใช่การลบตัวเอง
      if (userId === payload.id) {
        return NextResponse.json({ message: "คุณไม่สามารถลบตัวเองได้" }, { status: 400 });
      }

      // ✅ ลบสมาชิก และข้อมูลที่เกี่ยวข้อง
      await prisma.user.delete({
        where: { id: userId },
      });
      return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    }

    if (imageId) {
      // ✅ ลบรูปภาพ
      await prisma.gallery.delete({
        where: { id: imageId },
      });
      return NextResponse.json({ message: "Image deleted successfully" }, { status: 200 });
    }

    return NextResponse.json({ message: "Missing parameters" }, { status: 400 });

  } catch (error) {
    console.error("❌ Error deleting user or image:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
