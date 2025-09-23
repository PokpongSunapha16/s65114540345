"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FindTeamPopup from "../components/FindTeamPopup";
import TeamDetailPopup from "../components/TeamDetailPopup";

interface Team {
  id: number;
  name: string;
  description?: string | null;
  team_logo: string | null;
  court: string;
  start_at: string;
  end_at: string;
  type: string;
  district: string;
  privacy: string;
  member_count: number;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatTime = (timeString: string) => {
  return new Date(timeString).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatTeamType = (type: string) => {
  return type === "THREE_X_THREE" ? "3X3" : "5X5";
};

export default function FindTeamPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const [teamDetail, setTeamDetail] = useState<Team | null>(null);

  const fetchTeams = async (district: string, query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/findteam?district=${district}&query=${query}`);
      if (!res.ok) throw new Error("Failed to fetch teams");
      const data = await res.json();
      setTeams(data.teams || []);
      setFilteredTeams(data.teams || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      setTeams([]);
      setFilteredTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      fetchTeams(selectedDistrict, ""); // ค้นหาทั้งหมดถ้าค้นหาว่าง
    } else {
      fetchTeams(selectedDistrict, searchQuery.trim());
    }
  };
  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setSearchQuery("");
    setTeams([]);
    setFilteredTeams([]);

    // ✅ เมื่อเลือก "เลือกอำเภอ" ให้ทีมทั้งหมดหายไป
    if (district === "") {
      setFilteredTeams([]);
    } else {
      fetchTeams(district, "");
    }
  };
  

  const handleOpenPopup = (team: Team) => {
    setSelectedTeam(team);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedTeam(null);
  };

  const handleViewTeamDetail = (team: Team) => {
    console.log("📌 Team Detail:", team); // ✅ Debug ตรวจสอบว่ามี description จริงๆ
    setTeamDetail({
      ...team,
      description: team.description || "ไม่มีรายละเอียด", // ✅ กัน description เป็น null
    });
    setIsDetailPopupOpen(true);
  };
  
  
  
  const handleCloseDetailPopup = () => {
    setIsDetailPopupOpen(false); // ปิด popup
  };

  return (
    <div className="relative p-6 min-h-screen bg-gray-50">

      <h1 className="text-2xl font-bold text-center mb-6">ค้นหาทีม</h1>

      {/* กล่องค้นหา */}
      <div className="flex justify-between items-center bg-black py-2 px-4 rounded-lg shadow-md mb-6 w-2/3 mx-auto">
        <select
          value={selectedDistrict}
          onChange={handleDistrictChange}
          className="px-3 py-2 text-black border border-gray-300 rounded-md focus:ring focus:ring-orange-300 bg-white w-1/4"
        >
          <option value="">เลือกอำเภอ</option>
          <option value="MUEANG">เมืองอุบลราชธานี</option>
          <option value="SI_MUEANG_MAI">ศรีเมืองใหม่</option>
          <option value="KHONG_CHIAM">โขงเจียม</option>
          <option value="KHUEANG_NAI">เขื่องใน</option>
          <option value="KHEMMARAT">เขมราฐ</option>
          <option value="DET">เดชอุดม</option>
          <option value="NA_CHALUAI">นาจะหลวย</option>
          <option value="NAM_YUEN">น้ำยืน</option>
          <option value="BUNTHARIK">บุณฑริก</option>
          <option value="TRAKAN">ตระการพืชผล</option>
          <option value="KUT_KHAOPUN">กุดข้าวปุ้น</option>
          <option value="MUANG_SAM_SIP">ม่วงสามสิบ</option>
          <option value="WARIN">วารินชำราบ</option>
          <option value="PHIBUN">พิบูลมังสาหาร</option>
          <option value="TAN_SUM">ตาลสุม</option>
          <option value="PHO_SAI">โพธิ์ไทร</option>
          <option value="SAMRONG">สำโรง</option>
          <option value="DON_MOT_DAENG">ดอนมดแดง</option>
          <option value="SIRINDHORN">สิรินธร</option>
          <option value="THUNG_SI_UDOM">ทุ่งศรีอุดม</option>
          <option value="SI_LAK_CHAI">ศรีหลักชัย</option>
          <option value="NAM_KHUN">น้ำขุ่น</option>
          <option value="LAO_SUEA_KOK">เหล่าเสือโก้ก</option>
          <option value="SAWANG_WIRAWONG">สว่างวีระวงศ์</option>
        </select>

        <div className="relative w-2/3"> {/* ✅ ปรับให้ช่องค้นหาสั้นลง */}
          <input
            type="text"
            placeholder="ค้นหาชื่อทีม ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 w-full border border-gray-300 rounded-md focus:ring focus:ring-orange-300"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white px-3 py-1 rounded-md hover:bg-orange-600"
          >
            🔍
          </button>
        </div>
      </div>

      {/* รายการทีม */}
      <div className="flex justify-center items-center">
        {isLoading ? (
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        ) : filteredTeams.length === 0 ? (
          <p className="text-gray-500 text-lg font-bold">
            {selectedDistrict === "" ? "เลือกอำเภอหรือพิมพ์เพื่อค้นหา" : "ไม่พบทีมที่ค้นหา"}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-2/3">
            {filteredTeams.map((team) => (
              <div
              key={team.id}
              className="flex items-center p-4 border rounded-lg shadow-md bg-white cursor-pointer hover:bg-gray-100 transition"
              onClick={() => handleOpenPopup(team)}
            >
              <img
                src={team.team_logo || "/default-team.png"}
                alt={team.name}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div className="flex-1">
                <h2 className="font-bold text-lg">{team.name}</h2>
                <p className="text-sm text-gray-500">สนาม: {team.court}</p>
                <p className="text-sm text-gray-500">
                  วันที่: {formatDate(team.start_at)} - {formatDate(team.end_at)}
                </p>
                <p className="text-sm text-gray-500">
                  เวลา: {formatTime(team.start_at)} - {formatTime(team.end_at)}
                </p>
                <p className="text-sm font-bold mt-1 flex items-center">
                  {team.privacy === "PUBLIC" ? "🌍 สาธารณะ" : "🔒 ส่วนตัว"} 
                  <span className="ml-2 bg-gray-200 text-black px-2 py-1 rounded-md text-l font-bold">
                    {formatTeamType(team.type)}
                  </span>
                </p>
              </div>
              <span className="text-sm font-bold text-gray-600">
                {team.member_count} สมาชิก
              </span>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup แสดงข้อมูลทีม */}
{isPopupOpen && selectedTeam && (
  <FindTeamPopup
  team={selectedTeam}
  onClose={handleClosePopup}
  onViewTeam={(team) => handleViewTeamDetail(team)}/>
)}


{isDetailPopupOpen && teamDetail && (
  <TeamDetailPopup
    team={{ ...teamDetail, description: teamDetail.description ?? null }}
    onClose={handleCloseDetailPopup}
  />
)}



    </div>
  );
}
