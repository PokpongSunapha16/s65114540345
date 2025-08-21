import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function deleteExpiredTeams() {
    const now = new Date();
    console.log(`[JOB START] Checking for expired teams at ${now.toISOString()}`);

    try {
        const expiredTeams = await prisma.team.findMany({
            where: { end_at: { lt: now } }
        });

        if (expiredTeams.length === 0) {
            console.log("[JOB] No expired teams found.");
            return;
        }

        console.log(`[JOB] Found ${expiredTeams.length} expired teams. Deleting...`);

        for (const team of expiredTeams) {
            await prisma.team.delete({ where: { id: team.id } });
            console.log(`[JOB] Deleted team ID: ${team.id} - ${team.name}`);
        }
    } catch (error) {
        console.error("[ERROR] Failed to delete expired teams:", error);
    } finally {
        await prisma.$disconnect();
        console.log("[JOB END] Finished deleting expired teams.");
    }
}
