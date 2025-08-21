import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // ดึงข้อมูลผู้ใช้ทั้งหมดจาก database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        district: true, // ใช้ district ตาม schema
        profile_picture: true, // ใช้ profile_picture ตาม schema
      },
    });

    // สุ่ม 4 คนจากรายการผู้ใช้ทั้งหมด
    const shuffledUsers = users.sort(() => 0.5 - Math.random()).slice(0, 4);

    return NextResponse.json(shuffledUsers, { status: 200 });
  } catch (error) {
    console.error('Error fetching home random users:', error);
    return NextResponse.json({ error: 'Failed to fetch home random users' }, { status: 500 });
  }
}
