import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function getUserFromToken(req: NextRequest): Promise<{ id: number } | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    
    if (!payload || typeof payload.id !== "number") {
      console.error("🚨 Invalid JWT payload:", payload);
      return null;
    }

    return { id: payload.id };
  } catch (error) {
    console.error("🚨 Error verifying JWT:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Authenticated user ID:", user.id);

    // ✅ ดึงเฉพาะทีมที่ user คนนี้เป็นสมาชิกและ status เป็น APPROVED เท่านั้น
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: user.id, // ต้องเป็นสมาชิกที่มี userId ตรงกัน
            status: "APPROVED", // ต้องได้รับการอนุมัติแล้ว
          },
        },
      },
      select: { id: true, name: true },
    });

    console.log("📌 My Teams:", teams);
    return NextResponse.json({ teams });
  } catch (error) {
    console.error("🚨 Error fetching my teams:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
