"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ImagePopup from "@/app/components/ImagePopup"; // นำเข้า Popup component
import ReviewForm from "@/app/components/ReviewForm";


interface UserProfile {
  username: string;
  profile_picture: string;
  note: string;
  district: string;
  position: string;
  status: string;
}

interface Gallery {
  id: number;
  image: string;
}


interface Review {
  score: number;
  comment: string;
  reviewer_user: { username: string; profile_picture: string | null };
}

interface ReviewStats {
  averageScore: number;
  totalReviews: number;
}


export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State สำหรับ Popup
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id) || 0;
  

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/user/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user profile");
        const data = await res.json();

        setProfile(data.user);
        setGalleries(data.gallery || []);
        setReviews(data.reviews || []);
        setReviewStats(data.reviewStats || null);
      } catch (error: any) {
        console.error("Error fetching user profile:", error.message || error);
        setError("Failed to fetch user profile");
      }
    };

    fetchUserProfile();
  }, [userId]);


  const districtMap: Record<string, string> = {
    "MUEANG": "เมืองอุบลราชธานี",
    "SI_MUEANG_MAI": "ศรีเมืองใหม่",
    "KHONG_CHIAM": "โขงเจียม",
    "KHUEANG_NAI": "เขื่องใน",
    "KHEMMARAT": "เขมราฐ",
    "DET": "เดชอุดม",
    "NA_CHALUAI": "นาจะหลวย",
    "NAM_YUEN": "น้ำยืน",
    "BUNTHARIK": "บุณฑริก",
    "TRAKAN": "ตระการพืชผล",
    "KUT_KHAOPUN": "กุดข้าวปุ้น",
    "MUANG_SAM_SIP": "ม่วงสามสิบ",
    "WARIN": "วารินชำราบ",
    "PHIBUN": "พิบูลมังสาหาร",
    "TAN_SUM": "ตาลสุม",
    "PHO_SAI": "โพธิ์ไทร",
    "SAMRONG": "สำโรง",
    "DON_MOT_DAENG": "ดอนมดแดง",
    "SIRINDHORN": "สิรินธร",
    "THUNG_SI_UDOM": "ทุ่งศรีอุดม",
    "SI_LAK_CHAI": "ศรีหลักชัย",
    "NAM_KHUN": "น้ำขุ่น",
    "LAO_SUEA_KOK": "เหล่าเสือโก้ก",
    "SAWANG_WIRAWONG": "สว่างวีระวงศ์",
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image); // เปิด Popup และตั้งค่ารูปภาพที่เลือก
  };

  const handleClosePopup = () => {
    setSelectedImage(null); // ปิด Popup
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">

      {/* ข้อมูลโปรไฟล์ */}
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <img
          src={profile?.profile_picture || "/default-profile.png"}
          alt="Profile Picture"
          className="w-32 h-32 rounded-full mx-auto mb-4 border-2 border-orange-400"
        />
        <h1 className="text-2xl font-bold">{profile?.username}</h1>
        <p className="text-gray-500 mt-2">
          อำเภอ: {districtMap[profile?.district ?? "NONE"] ?? "ไม่มี"}
        </p>
        <p className="text-gray-500">ตำแหน่ง: {profile?.position || "ไม่ระบุ"}</p>
        <p className="text-gray-700 mt-4 italic">{profile?.note || "ไม่มีคำแนะนำตัว"}</p>

        {/* ✅ ปุ่ม "ข้อมูลการติดต่อ" ให้ทุกคนสามารถเห็นได้ */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push(`/user/${userId}/contact`)}  // 🔥 เพิ่ม onClick
            className="bg-green-500 text-white py-2 px-4 text-sm rounded hover:bg-green-600 transition"
          >
            ข้อมูลการติดต่อ
          </button>
        </div>
      </div>

      {/* อัลบั้มรูปภาพ */}
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full mt-6">
        <h2 className="text-lg font-bold text-center mb-4">อัลบั้มรูปภาพ</h2>
        <div className="grid grid-cols-3 gap-4">
          {galleries.map((gallery, index) => (
            <div
              key={gallery.id}
              className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative cursor-pointer"
              onClick={() => handleImageClick(gallery.image)} // เปิด Popup
            >
              <img
                src={gallery.image}
                alt={`Gallery Image ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* รีวิวจากผู้เล่น */}
      

      {/* Image Popup */}
      {selectedImage && (
        <ImagePopup image={selectedImage} onClose={handleClosePopup} />
      )}

{/* รีวิวจากผู้เล่น */}
<div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mt-6 text-center"> 
  <h2 className="text-xl font-bold">รีวิวจากผู้เล่น</h2> {/* ขยายขนาดตัวหนังสือ */}
  {reviewStats?.totalReviews ? (
    <p className="text-gray-500 mt-2 text-lg">
      คะแนนเฉลี่ย: {reviewStats.averageScore} ⭐ ({reviewStats.totalReviews} รีวิว)
    </p>
  ) : (
    <p className="text-gray-500 mt-4 text-lg">ยังไม่มีรีวิว</p>
  )}

  {reviews.map((review, index) => (
    <div key={index} className="border p-4 mt-4 rounded w-full">
      <div className="flex items-center">
        <img
          src={review.reviewer_user.profile_picture || "/default-profile.png"}
          alt="Reviewer"
          className="w-10 h-10 rounded-full mr-3"
        />
        <strong className="text-lg">{review.reviewer_user.username}</strong>
      </div>
      <p className="text-yellow-500 text-lg mt-2">⭐ {review.score}</p>
      <p className="text-gray-700 text-base">{review.comment}</p>
    </div>
  ))}
</div>

{/* ฟอร์มให้คะแนนรีวิว */}
<div className="mt-8 w-full max-w-lg">
  <ReviewForm userId={userId} onReviewSubmit={() => window.location.reload()} />
</div>


    </div>
  );
}
