import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const totalUsers = await prisma.user.count();
    const totalBlogs = await prisma.blog.count();
    const totalReports = await prisma.report.count();
    const totalImages = await prisma.gallery.count();

    return NextResponse.json({ totalUsers, totalBlogs, totalReports, totalImages });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
