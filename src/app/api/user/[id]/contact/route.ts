import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: any) {
  try {
    if (!params?.id) {
      console.error("❌ Missing user ID");
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      console.error("❌ Invalid user ID:", params.id);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    console.log("✅ Fetching contact info for user ID:", userId);

    // ✅ ตรวจสอบว่ามี contactInfo สำหรับ userId หรือไม่
    const contactInfo = await prisma.contactInfo.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            username: true,
            profile_picture: true,
          },
        },
      },
    });

    if (!contactInfo) {
      console.error("❌ Contact info not found for user:", userId);
      return NextResponse.json({ error: "User contact info not found" }, { status: 404 });
    }

    console.log("✅ Contact Info found:", contactInfo);

    return NextResponse.json({
      user: {
        username: contactInfo.user.username,
        profile_picture: contactInfo.user.profile_picture,
        contact: {
          facebook: contactInfo.facebook || "",
          instagram: contactInfo.instagram || "",
          line: contactInfo.line || "",
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in GET /user/[id]/contact:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
