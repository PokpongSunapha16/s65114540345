import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: Request, context: any) {
  try {
    const { teamName } = await Promise.resolve(context.params);

    if (!teamName) {
      return NextResponse.json({ error: "Invalid team name" }, { status: 400 });
    }

    const decodedTeamName = decodeURIComponent(teamName).replace(/-/g, " ");
    console.log("Received comment for team:", decodedTeamName);

    // ✅ ตรวจสอบ JWT Token (ใช้ await กับ cookies)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    let payload;
    try {
      ({ payload } = await jwtVerify(token, SECRET));
      if (!payload) throw new Error("Invalid payload");
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    const userId = payload?.id as number;

    // ✅ ตรวจสอบว่าทีมมีอยู่จริง
    const team = await prisma.team.findFirst({
      where: { name: decodedTeamName },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // ✅ รับข้อมูลความคิดเห็นจาก Body
    const requestBody = await req.json();
    console.log("📥 Received request body:", requestBody); // ตรวจสอบค่าที่ได้รับจาก frontend

    if (!requestBody.comment || typeof requestBody.comment !== "string" || requestBody.comment.trim() === "") {
      return NextResponse.json({ error: "Missing or invalid comment" }, { status: 400 });
    }

    // ✅ บันทึกความคิดเห็นลงใน Database (ใช้ CommentBoard ตาม schema.prisma)
    const newComment = await prisma.commentBoard.create({
      data: {
        teamId: team.id,
        userId: userId,
        content: requestBody.comment.trim(),
      },
    });

    console.log("✅ Comment added successfully:", newComment);
    return NextResponse.json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("🚨 Error posting comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
