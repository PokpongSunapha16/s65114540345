import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const query = searchParams.get("search")?.toLowerCase() || "";

    const blogs = await prisma.blog.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      orderBy: {
        createdAt: "desc", // ✅ เรียงจากใหม่ไปเก่า
      },
      take: 3, // ✅ จำกัดผลลัพธ์ที่ 3 บล็อกเท่านั้น
      select: {
        id: true,
        title: true,
        slug: true,
        picture: true,
        createdAt: true,
      },
    });

    // ✅ ตรวจสอบว่าข้อมูลใน `picture` มี `data:image/jpeg;base64,` หรือยัง
    const formattedBlogs = blogs.map((blog) => {
      let picture = blog.picture;

      // ถ้ามี MIME Type แล้ว ไม่ต้องเติมใหม่
      if (picture && !picture.startsWith("data:image")) {
        picture = `data:image/jpeg;base64,${picture}`;
      }

      return { ...blog, picture };
    });

    return NextResponse.json({ blogs: formattedBlogs });
  } catch (error) {
    console.error("🚨 API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
