import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: any) {
  try {
    const userId = parseInt(context.params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // ดึงข้อมูล User
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        profile_picture: true,
        note: true,
        district: true,
        position: true,
        status: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ดึงข้อมูล Gallery
    const gallery = await prisma.gallery.findMany({
      where: { user_id: userId },
      select: { id: true, image: true },
    });

    // ดึงข้อมูล Reviews และคำนวณคะแนนเฉลี่ย
    const reviews = await prisma.review.findMany({
      where: { reviewed_user_id: userId },
      select: {
        score: true,
        comment: true,
        reviewer_user: { select: { username: true, profile_picture: true } },
      },
    });

    const totalReviews = reviews.length;
    const averageScore = totalReviews > 0
      ? Math.round(reviews.reduce((acc, cur) => acc + cur.score, 0) / totalReviews)
      : 0;

    return NextResponse.json({ user, gallery, reviews, reviewStats: { averageScore, totalReviews } });
  } catch (error) {
    console.error("Error fetching user profile and reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
