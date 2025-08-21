"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Dialog } from "@headlessui/react";
import LeaveTeamButton from "@/app/components/LeaveTeamButton";

interface TeamDetails {
  name: string;
  team_logo: string | null;
  court: string;
  start_at: string;
  end_at: string;
  type: string;
  district: string;
  privacy: string;
  description: string;
  created_by: number;
  map: string | null;
}

// 🔄 Map อำเภอเป็นภาษาไทย
const districtMapping: Record<string, string> = {
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

export default function TeamDetailPage() {
  const router = useRouter();
  const { teamName } = useParams();
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false); // ✅ State สำหรับแสดง Popup แผนที่
  const [mapLink, setMapLink] = useState<string>(""); // ✅ State สำหรับเก็บลิงก์แผนที่
  const [isSaving, setIsSaving] = useState(false); // ✅ State สำหรับสถานะการบันทึก

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (!teamName || Array.isArray(teamName)) return; // ✅ ป้องกัน undefined หรือ array
        const decodedTeamName = decodeURIComponent(teamName);
        console.log("Fetching team:", decodedTeamName);
  
        const res = await fetch(`/api/team_management/${encodeURIComponent(decodedTeamName)}`, {
          credentials: "include",
        });
  
        if (!res.ok) throw new Error("Failed to fetch team details");
  
        const data = await res.json();
        console.log("Fetched team data:", data);
        setTeam(data.team);
        setMapLink(data.team.map || ""); // ✅ ดึงค่าลิงก์แผนที่จาก Database

        if (data.team.map) {
          setMapLink(data.team.map);
        }
  
        type TeamMember = { userId: number; role: string; status: string };
        const userMembership = data.team.members.find((member: TeamMember) => member.userId === data.currentUser);
  
        if (data.team.created_by === data.currentUser || userMembership?.role === "CAPTAIN") {
          setIsOwner(true);
        }
      } catch (error) {
        console.error("Error fetching team details:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTeam();
  }, [teamName]);  

  
  const handleSaveMapLink = async () => {
    try {
      if (!teamName || Array.isArray(teamName)) return; // ✅ ป้องกันข้อผิดพลาดก่อนใช้
      setIsSaving(true);
  
      const response = await fetch(`/api/team_management/${encodeURIComponent(teamName)}/map`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map: mapLink }),
      });
  
      if (!response.ok) throw new Error("Failed to update map link");
  
      alert("บันทึกสำเร็จ!");
    } catch (error) {
      console.error("Error updating map link:", error);
      alert("เกิดข้อผิดพลาด!");
    } finally {
      setIsSaving(false);
    }
  };  
  

  if (isLoading) {
    return <p className="text-center text-gray-500">กำลังโหลด...</p>;
  }

  if (!team) {
    return <p className="text-center text-red-500">ไม่พบข้อมูลทีม</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
        <img
          src={team.team_logo || "/default-team.png"}
          alt={team.name}
          className="w-24 h-24 mx-auto rounded-full"
        />
        <h1 className="text-2xl font-bold mt-4">{team.name}</h1>


        <div className="mt-3 flex flex-col items-center">
  {/* ✅ แสดงอำเภอและสนามในบรรทัดเดียวกัน */}
  <p className="text-sm text-gray-500 flex items-center gap-2">
    📍 <span className="text-red-500">{districtMapping[team.district] || team.district}</span>
    <span className="text-green-500">{team.court}</span>
  </p>

  {/* ✅ ปุ่มจัดเรียงในบรรทัดเดียวกัน */}
  <div className="mt-2 flex items-center gap-2">
    <button
      onClick={() => setIsDescriptionOpen(true)}
      className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded-md text-sm flex items-center space-x-1"
    >
      📄 รายละเอียด
    </button>

    <button
          onClick={() => setIsMapOpen(true)}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded-md text-sm flex items-center space-x-1"
        >
          🗺️ แผนที่
        </button>

    {/* ✅ ปุ่มแก้ไข (เฉพาะเจ้าของทีม) */}
    {isOwner && (
      <button
      onClick={() => router.push(`/team_management/${encodeURIComponent(teamName as string)}/edit`)}
      className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded-md text-sm flex items-center space-x-1"
    >
        ✏️ แก้ไขข้อมูลทีม
      </button>
      )}
    </div>
  </div>


        {/* ✅ แสดงวันที่ที่อยู่ถัดจากปุ่ม "รายละเอียด" */}
        <p className="mt-2 text-gray-600 text-sm">
          📅 วันที่: {new Date(team.start_at).toISOString().split("T")[0]} -{" "}
          {new Date(team.end_at).toISOString().split("T")[0]}
        </p>

        {/* ✅ ความเป็นส่วนตัว และ เวลา */}
        <div className="mt-2 text-gray-600 text-sm flex justify-center gap-2">
          {team.privacy === "PUBLIC" ? "🌍 สาธารณะ" : "🔒 ส่วนตัว"} | 🕒{" "}
          {new Date(team.start_at).toLocaleTimeString()} -{" "}
          {new Date(team.end_at).toLocaleTimeString()}
        </div>
        
        {/* ปุ่ม ออกจากทีม */}
        <LeaveTeamButton>
        </LeaveTeamButton>
        </div>
        

      <div className="mt-6 w-full max-w-md space-y-3">
        <button
        onClick={() => router.push(`/team_management/${encodeURIComponent(teamName as string)}/member`)}
        className="w-full bg-white flex items-center justify-center border-2 border-gray-400 p-4 rounded-lg text-lg font-bold shadow-md">
          🏀 สมาชิกทีม
        </button>

        <button
            className="w-full bg-white flex items-center justify-center border-2 border-gray-400 p-4 rounded-lg text-lg font-bold shadow-md"
            onClick={() => router.push(`/team_management/${teamName}/contact`)} // ✅ นำทางไปหน้า contact
        >
            📞 ช่องทางติดต่อ
        </button>


        <button className="w-full bg-white flex items-center justify-center border-2 border-gray-400 p-4 rounded-lg text-lg font-bold shadow-md"
        onClick={() => router.push(`/team_management/${teamName}/comment_board`)}
        >
        📋 กระดานความคิดเห็น
        </button>
      </div>

      {/* Popup คำอธิบายทีม */}
      <Dialog open={isDescriptionOpen} onClose={() => setIsDescriptionOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
            <Dialog.Title className="text-xl font-bold">รายละเอียดทีม</Dialog.Title>
            <Dialog.Description className="mt-2 text-gray-700">{team.description}</Dialog.Description>
            <button onClick={() => setIsDescriptionOpen(false)} className="mt-4 bg-gray-200 px-4 py-2 rounded-md">
              ปิด
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Popup แผนที่ */}
      <Dialog open={isMapOpen} onClose={() => setIsMapOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
            <Dialog.Title className="text-xl font-bold">🗺️ ลิงก์แผนที่</Dialog.Title>

            <input
              type="text"
              value={mapLink || ""}
              readOnly={!isOwner}
              onChange={(e) => setMapLink(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />

            <p className="text-gray-500 text-sm mt-1">สามารถกดคัดลอกได้</p>

            <button
              onClick={() => navigator.clipboard.writeText(mapLink)}
              className="bg-blue-500 text-white px-3 py-1 rounded mt-3"
            >
              📋 คัดลอก
            </button>

            {isOwner && (
              <button
                onClick={handleSaveMapLink}
                className="bg-green-500 text-white px-3 py-1 rounded mt-3 ml-2"
                disabled={isSaving}
              >
                {isSaving ? "กำลังบันทึก..." : "💾 บันทึก"}
              </button>
            )}

            <button onClick={() => setIsMapOpen(false)} className="bg-gray-300 px-3 py-1 rounded mt-3 ml-2">
              ปิด
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
