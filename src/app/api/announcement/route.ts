import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // ✅ ตรวจสอบให้แน่ใจว่าได้ import Prisma Client ถูกต้อง

export async function GET() {
  try {
    // ดึงประกาศล่าสุดจากตาราง announcement
    const latestAnnouncement = await prisma.announcement.findFirst({
      orderBy: { updatedAt: 'desc' }, // ✅ เรียงจากล่าสุด
    });

    if (!latestAnnouncement) {
      return NextResponse.json({ content: 'ไม่มีประกาศในขณะนี้', updatedAt: new Date() });
    }

    return NextResponse.json({
      content: latestAnnouncement.content,
      updatedAt: latestAnnouncement.updatedAt,
    });
  } catch (error) {
    console.error('🚨 Error fetching announcement:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}
