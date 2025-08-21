import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");


export async function DELETE(req: Request, { params }: any) {
  try {
    const commentId = parseInt(params.id, 10);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }

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

    // ✅ ตรวจสอบว่าคอมเมนต์มีอยู่หรือไม่
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true }, // ✅ ดึง userId ของเจ้าของคอมเมนต์
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // ✅ ตรวจสอบว่าเป็นเจ้าของคอมเมนต์หรือไม่
    if (comment.userId !== userId) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // ✅ ลบคอมเมนต์
    await prisma.blogComment.delete({ where: { id: commentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🚨 Error deleting comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
