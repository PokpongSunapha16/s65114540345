import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const reviewer_user_id = payload.id as number;

    const { reviewed_user_id, score, comment } = await req.json();

    if (!reviewed_user_id || score < 1 || score > 5) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (reviewer_user_id === reviewed_user_id) {
      return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { reviewed_user_id_reviewer_user_id: { reviewed_user_id, reviewer_user_id } },
    });

    if (existingReview) {
      await prisma.review.update({
        where: { id: existingReview.id },
        data: { score, comment, updated_at: new Date() },
      });
    } else {
      await prisma.review.create({
        data: { reviewed_user_id, reviewer_user_id, score, comment },
      });
    }

    return NextResponse.json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = parseInt(url.searchParams.get("userId") || "0", 10);

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { reviewed_user_id: userId },
      select: {
        score: true,
        comment: true,
        reviewer_user: { select: { username: true, profile_picture: true } },
      },
    });

    const totalReviews = reviews.length;
    const averageScore = totalReviews > 0 ?
      Math.round(reviews.reduce((acc, cur) => acc + cur.score, 0) / totalReviews) : 0;

    return NextResponse.json({ reviews, reviewStats: { averageScore, totalReviews } });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
