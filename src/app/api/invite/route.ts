import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

interface UserPayload {
  id: number;
  email: string;
  exp: number;
}

async function getUserFromToken(req: NextRequest): Promise<UserPayload | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderId = user.id;
    const { teamId, receiverId } = await req.json();

    console.log("📌 ข้อมูลที่ได้รับจาก Client:", { teamId, receiverId, senderId });

    if (!teamId || !receiverId) {
      console.error("❌ Missing required fields:", { teamId, receiverId });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ ตรวจสอบว่า sender เป็นสมาชิกของทีม
    const isMember = await prisma.teamMember.findFirst({
      where: { teamId, userId: senderId, status: "APPROVED" },
    });

    if (!isMember) {
      console.error("❌ User is not a member of this team:", senderId);
      return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 });
    }

    // ✅ ตรวจสอบว่า receiver เป็นสมาชิกของทีมอยู่แล้วหรือไม่
    const receiverInTeam = await prisma.teamMember.findFirst({
      where: { teamId, userId: receiverId, status: "APPROVED" },
    });

    if (receiverInTeam) {
      console.error("❌ Receiver is already in the team:", receiverId);
      return NextResponse.json({ error: "❌ ผู้เล่นคนนี้อยู่ในทีมแล้ว" }, { status: 400 });
    }

    // ✅ ตรวจสอบว่ามีคำเชิญอยู่แล้วหรือไม่
    const existingInvite = await prisma.notification.findFirst({
      where: { teamId, senderId, receiverId, type: "TEAM_INVITE" },
    });

    if (existingInvite) {
      console.error("❌ Invitation already exists for:", { teamId, senderId, receiverId });
      return NextResponse.json({ error: "Invitation already sent" }, { status: 409 });
    }

    // ✅ สร้างคำเชิญ
    const newInvite = await prisma.notification.create({
      data: {
        senderId,
        receiverId,
        teamId,
        type: "TEAM_INVITE",
        status: "UNREAD",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("✅ Invitation Created:", newInvite);
    return NextResponse.json({ message: "✅ คำเชิญถูกส่งเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error sending invite:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
