"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Index() {
  return (
    <div className="bg-orange-400 min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-screen-xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left Side: Logo and Text */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                เว็บไซต์หาเพื่อนเล่นบาสเกตบอล
              </h1>
              <h2 className="text-2xl font-bold text-orange-600 mb-4">
                เพื่อชาวอุบลราชธานี
              </h2>
              <div className="flex justify-center md:justify-start mb-4">
                <Image
                  src="/images/logo.png"
                  alt="Ubon Hooper Club Logo"
                  width={250}
                  height={250}
                  className="rounded-full"
                />
              </div>
            </div>

            {/* Right Side: Image Swiper */}
            <div className="flex justify-center items-center w-full h-[400px]">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop
                className="w-full h-full"
              >
                {/* Swiper Slides */}
                {["SamplePic2.jpg", "SamplePic3.jpg", "SamplePic4.jpg", "SamplePic.jpg"].map(
                  (pic, index) => (
                    <SwiperSlide key={index} className="flex justify-center items-center">
                      <div className="relative w-full h-[400px]">
                        <Image
                          src={`/images/${pic}`}
                          alt={`Slide ${index + 1}`}
                          fill
                          style={{ objectFit: "cover" }} // ใช้ style สำหรับปรับขนาดรูปภาพ
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </SwiperSlide>
                  )
                )}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
