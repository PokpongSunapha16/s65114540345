import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

// Handle fetching gallery images
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies(); // ใช้ await
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as number;

    const galleries = await prisma.gallery.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        image: true,
        upload_at: true,
      },
      orderBy: { upload_at: "desc" },
    });

    return NextResponse.json(galleries);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

// Handle uploading a gallery image
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies(); // ใช้ await
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as number;

    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "รูปภาพไม่ถูกต้อง" }, { status: 400 });
    }

    const galleryCount = await prisma.gallery.count({
      where: { user_id: userId },
    });

    if (galleryCount >= 3) {
      return NextResponse.json(
        { error: "คุณสามารถอัปโหลดได้สูงสุด 3 รูปภาพ" },
        { status: 400 }
      );
    }

    const newGallery = await prisma.gallery.create({
      data: {
        user_id: userId,
        image,
      },
    });

    return NextResponse.json({ message: "อัปโหลดรูปภาพสำเร็จ", gallery: newGallery });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

// Handle deleting a gallery image
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json(); // รับ ID ของรูปภาพจาก Request Body

    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies(); // ใช้ await
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as number;

    // ตรวจสอบว่ารูปภาพที่ต้องการลบเป็นของผู้ใช้ปัจจุบัน
    const gallery = await prisma.gallery.findUnique({
      where: { id: Number(id) },
    });

    if (!gallery || gallery.user_id !== userId) {
      return NextResponse.json(
        { error: "Image not found or unauthorized" },
        { status: 404 }
      );
    }

    // ลบรูปภาพจากฐานข้อมูล
    await prisma.gallery.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "Image deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
