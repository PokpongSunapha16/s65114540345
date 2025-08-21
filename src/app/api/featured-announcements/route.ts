import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // ✅ ตรวจสอบให้แน่ใจว่า import Prisma Client ถูกต้อง

export async function GET() {
  try {
    // ดึงข้อมูล 3 ประกาศล่าสุดจากตาราง featuredannouncement
    const announcements = await prisma.featuredAnnouncement.findMany({
      orderBy: { createdAt: 'desc' }, // ✅ เรียงจากล่าสุด
      take: 3, // ✅ จำกัดแค่ 3 รายการ
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('🚨 Error fetching featured announcements:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}
