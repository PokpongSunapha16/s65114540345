import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function GET(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const userId = Number(payload.id);

    // ✅ ใช้ `findUnique` เพราะ `userId` เป็น `@unique`
    const contactInfo = await prisma.contactInfo.findUnique({ where: { userId } });

    return NextResponse.json({ contact: contactInfo ?? { facebook: "", instagram: "", line: "" } });
  } catch (error) {
    console.error("❌ Error in GET /profile/contact/edit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const userId = Number(payload.id);
    if (!userId) return NextResponse.json({ error: "Invalid user" }, { status: 403 });

    const { facebook = "", instagram = "", line = "" } = await req.json();

    const updatedContact = await prisma.contactInfo.upsert({
      where: { userId },
      update: { facebook, instagram, line },
      create: { userId, facebook, instagram, line },
    });

    return NextResponse.json({ message: "Contact info updated successfully", contact: updatedContact });
  } catch (error) {
    console.error("❌ Error updating contact info:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
