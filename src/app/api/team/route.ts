// API สำหรับลบทีมหมดอายุ


import { NextResponse } from "next/server";
import { deleteExpiredTeams } from "../../../../prisma/scripts/deleteExpiredTeams";

export async function GET() {
    try {
        await deleteExpiredTeams();
        return NextResponse.json({ message: "Expired teams deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting expired teams:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
