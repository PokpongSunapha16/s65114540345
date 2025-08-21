'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// กำหนด type ของข้อมูลประกาศ, ผู้ใช้งาน และบล็อก

interface User {
  id: number;
  username: string;
  district: string;
  profile_picture: string | null;
}

interface Blog {
  id: number;
  title: string;
  picture: string | null;
  slug: string;
}

interface Announcement {
  content: string;
  updatedAt: string;
}

// กำหนด type ของข้อมูลประกาศที่น่าสนใจ
interface FeaturedAnnouncement {
  id: number;
  title: string;
  details: string;
  image: string;
  linkUrl: string;
}

const districtMapping: { [key: string]: string } = {
  NONE: 'ไม่ระบุ',
  SI_MUEANG_MAI: "ศรีเมืองใหม่",
  KHONG_CHIAM: "โขงเจียม",
  KHUEANG_NAI: "เขื่องใน",
  KHEMMARAT: "เขมราฐ",
  DET: "เดชอุดม",
  NA_CHALUAI: "นาจะหลวย",
  NAM_YUEN: "น้ำยืน",
  BUNTHARIK: "บุณฑริก",
  TRAKAN: "ตระการพืชผล",
  KUT_KHAOPUN: "กุดข้าวปุ้น",
  MUANG_SAM_SIP: "ม่วงสามสิบ",
  WARIN: "วารินชำราบ",
  PHIBUN: "พิบูลมังสาหาร",
  TAN_SUM: "ตาลสุม",
  PHO_SAI: "โพธิ์ไทร",
  SAMRONG: "สำโรง",
  DON_MOT_DAENG: "ดอนมดแดง",
  SIRINDHORN: "สิรินธร",
  THUNG_SI_UDOM: "ทุ่งศรีอุดม",
  SI_LAK_CHAI: "ศรีหลักชัย",
  NAM_KHUN: "น้ำขุ่น",
  LAO_SUEA_KOK: "เหล่าเสือโก้ก",
  SAWANG_WIRAWONG: "สว่างวีระวงศ์",
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [featuredAnnouncements, setFeaturedAnnouncements] = useState<FeaturedAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch('/api/home-random-users'),
          fetch('/api/home-random-blogs'),
          fetch('/api/announcement'), // ✅ ดึงประกาศล่าสุด
          fetch('/api/featured-announcements'), // ✅ ดึงประกาศที่น่าสนใจ
        ]);

        if (responses.some((res) => !res.ok)) {
          throw new Error('Failed to fetch data');
        }

        const [usersData, blogsData, announcementData, featuredData] = await Promise.all(
          responses.map((res) => res.json())
        );

        setUsers(usersData);
        setBlogs(blogsData);
        setAnnouncement(announcementData);
        setFeaturedAnnouncements(featuredData);
      } catch (error) {
        console.error('🚨 Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    // ฟังก์ชันแปลง `updatedAt` ให้เป็น `DD/MM/YYYY`
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

  return (
    <div className="bg-gray-100 p-6">
      {/* ส่วนหัวของหน้า */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-600">ประกาศของทางเว็บไซต์</h1>
        <p className="mt-2 text-lg">
          {announcement ? announcement.content : '📢 กำลังโหลดข้อมูล...'}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {announcement ? `อัพเดทล่าสุด - ${formatDate(announcement.updatedAt)}` : ''}
        </p>
      </header>

      {/* ส่วนประกาศที่น่าสนใจ */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">📢 ประกาศที่น่าสนใจ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {featuredAnnouncements.length > 0 ? (
            featuredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                onClick={() => window.open(announcement.linkUrl, '_blank')}
              >
                <img src={announcement.image} alt={announcement.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  <p className="mt-2 text-gray-600">{announcement.details}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">ไม่มีประกาศที่น่าสนใจในขณะนี้</p>
          )}
        </div>
      </section>

      {/* ส่วนบล็อกที่แนะนำ */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">📄 บล็อกที่แนะนำ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
              onClick={() => router.push(`/blog/show/${blog.slug}`)}
            >
              {/* ✅ แก้ไขการแสดงรูปภาพ */}
              {blog.picture ? (
                <img
                  src={`data:image/jpeg;base64,${blog.picture}`}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  ไม่มีรูปภาพ
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold text-lg">{blog.title}</h3>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right text-sm mt-4 cursor-pointer hover:underline">
          <span onClick={() => router.push('/blog')}>MORE ...</span>
        </div>
      </section>
    

      {/* ส่วนผู้ใช้งานที่น่าสนใจ */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">👥 ผู้ใช้งานที่น่าสนใจ</h2>
        {loading ? (
          <p>⏳ กำลังโหลด...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                  <img
                    src={user.profile_picture || '/default-avatar.png'}
                    alt={user.username}
                    className="w-20 h-20 rounded-full object-cover mb-2"
                  />
                  <h3 className="font-semibold">{user.username}</h3>
                  <p className="text-sm text-orange-500">{districtMapping[user.district] || 'ไม่ระบุ'}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">ไม่มีผู้ใช้งานที่แนะนำในขณะนี้</p>
            )}
          </div>
        )}
        <div className="text-right text-sm mt-4 cursor-pointer hover:underline">
          <span onClick={() => router.push('/findplayer')}>MORE ...</span>
        </div>
      </section>
    </div>
  );
}
