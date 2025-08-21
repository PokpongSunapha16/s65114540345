"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface TeamDetails {
  name: string;
  team_logo: string | null;
  court: string;
  start_at: string;
  end_at: string;
  district: string;
  privacy: string;
  description: string;
}

// 🔄 Map อำเภอเป็นภาษาไทย
const districtMapping: Record<string, string> = {
  MUEANG: "เมืองอุบลราชธานี",
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

export default function EditTeamPage() {
  const router = useRouter();
  const { teamName } = useParams();
  const safeTeamName = teamName ? decodeURIComponent(String(teamName)) : "";
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/team_management/${encodeURIComponent(safeTeamName)}`);
        if (!res.ok) throw new Error("Failed to fetch team details");

        const data = await res.json();
        setTeam(data.team);
      } catch (error) {
        console.error("Error fetching team details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (safeTeamName) fetchTeam();
  }, [safeTeamName]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeam((prev) => (prev ? { ...prev, team_logo: reader.result as string } : null));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    if (!team) return;

    try {
      const res = await fetch(`/api/team_management/${encodeURIComponent(safeTeamName)}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(team),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update team");
      }

      alert("✅ ข้อมูลทีมอัปเดตสำเร็จ!");
      router.push(`/team_management/`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating team:", error);
        alert(`❌ ไม่สามารถบันทึกข้อมูลได้\n\n${error.message}`);
      } else {
        console.error("Unknown error updating team:", error);
        alert("❌ ไม่สามารถบันทึกข้อมูลได้");
      }
    }
  };

  if (loading) return <p className="text-center text-gray-500">กำลังโหลด...</p>;
  if (!team) return <p className="text-center text-red-500">ไม่พบข้อมูลทีม</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">📝 แก้ไขข้อมูลทีม</h1>

      {/* ✅ วงกลมอัปโหลดรูปภาพ */}
      <div className="flex flex-col items-center">
        <label htmlFor="teamLogo" className="cursor-pointer">
          <img
            src={team.team_logo || "/default-team.png"}
            alt="Team Logo"
            className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
          />
        </label>
        <input id="teamLogo" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </div>

      {/* ✅ ฟอร์มแก้ไขข้อมูล */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">รายละเอียดทีม</label>
          <textarea
            value={team.description}
            onChange={(e) => setTeam({ ...team, description: e.target.value })}
            className="w-full border p-2 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">อำเภอ</label>
          <select
            value={team.district}
            onChange={(e) => setTeam({ ...team, district: e.target.value })}
            className="w-full border p-2 rounded-md"
          >
            {Object.keys(districtMapping).map((d) => (
              <option key={d} value={d}>
                {districtMapping[d]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">สนาม</label>
          <input
            type="text"
            value={team.court}
            onChange={(e) => setTeam({ ...team, court: e.target.value })}
            className="w-full border p-2 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">ความเป็นส่วนตัว</label>
          <select
            value={team.privacy}
            onChange={(e) => setTeam({ ...team, privacy: e.target.value })}
            className="w-full border p-2 rounded-md"
          >
            <option value="PUBLIC">🌍 สาธารณะ</option>
            <option value="PRIVATE">🔒 ส่วนตัว</option>
          </select>
        </div>

        <div className="flex space-x-2 mt-4">
          <button onClick={handleSaveChanges} className="bg-green-500 text-white px-4 py-2 rounded-md">
            ✅ บันทึก
          </button>
          <button onClick={() => router.back()} className="bg-gray-300 px-4 py-2 rounded-md">
            ❌ ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
