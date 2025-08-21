import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

interface Context {
  params: {
    teamName: string;
  };
}

// ✅ ฟังก์ชันดึง user จาก JWT Token
async function getUserFromToken(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = await (await cookieStore).get("token")?.value;

    if (!token) {
      console.warn("🚨 No token found in cookies.");
      return null;
    }

    const { payload } = await jwtVerify(token, SECRET);
    console.log("✅ User verified from token:", payload);

    if (!payload || typeof payload.id !== "number") {
      console.error("🚨 Invalid user ID format in token:", payload);
      return null;
    }

    return { userId: payload.id }; // ✅ ตรวจสอบให้แน่ใจว่า `userId` เป็น `number`
  } catch (error) {
    console.error("🚨 JWT Verification failed:", error);
    return null;
  }
}

// ✅ GET - ดึงความคิดเห็นของทีม
export async function GET(req: NextRequest, context: any) {
  try {
    const { teamName } = context.params;
    const decodedTeamName = decodeURIComponent(teamName).replace(/-/g, " "); // ✅ แปลง "-" กลับเป็นช่องว่าง
    console.log("🔍 Fetching comments for team:", decodedTeamName);

    const team = await prisma.team.findFirst({
      where: { name: decodedTeamName }, // ✅ ใช้ชื่อทีมที่แปลงแล้ว
      select: { id: true },
    });

    if (!team) {
      console.log("🚨 Team not found:", decodedTeamName);
      return NextResponse.json([], { status: 404 });
    }

    const comments = await prisma.commentBoard.findMany({
      where: { teamId: team.id },
      include: { user: { select: { username: true, profile_picture: true } } },
      orderBy: { createdAt: "asc" },
    });

    console.log("✅ Comments fetched:", comments);
    return NextResponse.json(comments);
  } catch (error) {
    console.error("🚨 Error fetching comments:", error);
    return NextResponse.json([], { status: 500 });
  }
}


// ✅ POST - โพสต์ความคิดเห็น
export async function POST(req: NextRequest, context: any) {
  try {
    const params = await Promise.resolve(context.params);
    const decodedTeamName = decodeURIComponent(params.teamName);
    console.log("✏️ Receiving comment for team:", decodedTeamName);

    const user = await getUserFromToken(req);
    if (!user || !user.userId) {
      console.warn("🚨 Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content || content.trim().length === 0) {
      console.warn("🚨 Missing or invalid comment content.");
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const teamNameDecoded = decodeURIComponent(params.teamName).replace(/-/g, " ");
    const team = await prisma.team.findFirst({
      where: { name: teamNameDecoded },
      select: { id: true },
    });
    

    if (!team) {
      console.warn("🚨 Team not found:", decodedTeamName);
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // ✅ บันทึกความคิดเห็นลงฐานข้อมูล
    const newComment = await prisma.commentBoard.create({
      data: {
        teamId: team.id,
        userId: user.userId, // ✅ userId ตอนนี้แน่นอนว่าเป็น number
        content: content.trim(),
      },
    });

    console.log("✅ Comment added successfully:", newComment.id);
    return NextResponse.json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("🚨 Error posting comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
