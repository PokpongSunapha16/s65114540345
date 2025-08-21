"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaStar } from "react-icons/fa";
import ImagePopup from "../components/ImagePopup";

interface UserProfile {
  username: string;
  profile_picture: string;
  note: string;
  district: string;
  position: string;
  status: string;
  reviewStats?: {
    averageScore: number;
    totalReviews: number;
  };
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Popup image state
  const [reviews, setReviews] = useState<Review[]>([]); // ✅ เพิ่ม state รีวิว
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null); // ✅ เพิ่ม state ค่าสถิติรีวิว
  const [loading, setLoading] = useState(true); // สถานะการโหลด
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ดึงข้อมูลโปรไฟล์
        const profileRes = await fetch("/api/profile", { credentials: "include" });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // ดึงข้อมูลอัลบั้มรูปภาพ
        const galleryRes = await fetch("/api/gallery", { credentials: "include" });
        if (!galleryRes.ok) throw new Error("Failed to fetch gallery");
        const galleryData: Gallery[] = await galleryRes.json();
        setGalleries(galleryData);

        // ดึงข้อมูลรีวิว
        setReviews(profileData.reviews || []);
        setReviewStats(profileData.reviewStats || null);

        setLoading(false); // โหลดสำเร็จ
      } catch (error: any) {
        console.error("Error fetching data:", error.message || error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditRedirect = () => {
    router.push("/edit_profile");
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image); // Set selected image for popup
  };

  const handleClosePopup = () => {
    setSelectedImage(null); // Close popup
  };

  const handleDeleteImage = async (id: number) => {
    const confirmDelete = confirm("คุณต้องการลบรูปภาพนี้หรือไม่?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete image");
      }

      setGalleries((prev) => prev.filter((gallery) => gallery.id !== id));
      alert("ลบรูปภาพสำเร็จ");
    } catch (error: any) {
      console.error("Error deleting image:", error.message || error);
      alert("ลบรูปภาพไม่สำเร็จ");
    }
  };

  const renderStars = () => {
    const totalStars = 5;
    const averageScore = reviewStats?.averageScore || 0;

    return (
      <div className="flex justify-center mt-2">
        {Array.from({ length: totalStars }, (_, index) => (
          <FaStar
            key={index}
            className={`text-2xl ${index < averageScore ? "text-yellow-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">

    {/* Profile Section */}
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

      {/* ปุ่มแก้ไขโปรไฟล์ & ข้อมูลการติดต่อ */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={handleEditRedirect}
          className="bg-blue-500 text-white py-2 px-4 text-sm rounded hover:bg-blue-600"
        >
          แก้ไขโปรไฟล์
        </button>

        <button
          onClick={() => router.push("/profile/contact")} // ✅ เพิ่ม onClick
          className="bg-green-500 text-white py-2 px-4 text-sm rounded hover:bg-green-600"
        >
          ข้อมูลการติดต่อ
        </button>
      </div>
    </div>



      {/* Gallery Section */}
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full mt-6">
        <h2 className="text-lg font-bold text-center mb-4">อัลบั้มรูปภาพ</h2>
        <div className="grid grid-cols-3 gap-4">
          {galleries.map((gallery, index) => (
            <div
              key={gallery.id}
              className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative cursor-pointer"
              onClick={() => handleImageClick(gallery.image)}
            >
              <img
                src={gallery.image}
                alt={`Gallery Image ${index}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation(); // หยุด Event ไม่ให้ Popup เปิด
                  handleDeleteImage(gallery.id);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
              >
                ลบ
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => router.push("/upload_gallery")}
            className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600"
          >
            อัพโหลดรูปภาพ
          </button>
        </div>
      </div>

{/* รีวิวจากผู้เล่น */}
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full mt-6 text-center">
        <h2 className="text-lg font-bold">รีวิวที่ได้รับ</h2>
        {renderStars()}
        {reviewStats?.totalReviews ? (
          <p className="text-gray-500 mt-2">
            คะแนนเฉลี่ย: {reviewStats.averageScore} ({reviewStats.totalReviews} รีวิว)
          </p>
        ) : (
          <p className="text-gray-500 mt-4">ยังไม่มีรีวิว</p>
        )}

        {/* รายการรีวิว */}
        {reviews.map((review, index) => (
          <div key={index} className="border p-2 mt-2 rounded text-left">
            <div className="flex items-center">
              <img
                src={review.reviewer_user.profile_picture || "/default-profile.png"}
                alt="Reviewer"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <strong>{review.reviewer_user.username}</strong>
                <p className="text-yellow-500">⭐ {review.score}</p>
              </div>
            </div>
            <p className="text-gray-600 mt-1">{review.comment}</p>
          </div>
        ))}
      </div>

      {/* Image Popup */}
      {selectedImage && (
        <ImagePopup image={selectedImage} onClose={handleClosePopup} />
      )}
    </div>
  );
}
