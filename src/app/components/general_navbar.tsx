import React from "react";
import Link from "next/link";
import Image from "next/image";

const GeneralNavbar: React.FC = () => {
  return (
    <nav className="bg-orange-600 p-4">
      <div className="flex justify-between items-center">
        {/* โลโก้และข้อความ Ubon Hooper */}
        
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Image
              src="/images/logo.png" // Path รูปใน public
              alt="Logo"
              width={50} // ปรับขนาดรูปให้เล็กลงเพื่อความคมชัด
              height={50}
              className="mr-2"
            />
          </div>
          <h1 className="text-white text-xl font-semibold">
            Ubon Hooper Club
          </h1>
        </div>

        {/* ลิงก์ใน Navbar */}
        <div className="space-x-4">
          <Link href="/" className="text-white hover:text-gray-400">
            หน้าแรก
          </Link>
          <Link href="/blog" className="text-white hover:text-gray-400">
            บล็อก
          </Link>
          <Link href="/about" className="text-white hover:text-gray-400">
            เกี่ยวกับ
          </Link>
          <Link href="/signin" className="text-white hover:text-gray-400">
            เข้าสู่ระบบ
          </Link>


        </div>
      </div>
    </nav>
  );
};

export default GeneralNavbar;
