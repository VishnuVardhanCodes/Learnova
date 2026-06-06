import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/error-handler";
import { requireAuth } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDb } from "@/lib/mongodb";
import {
  ensureMeetingIndexes,
  getMeetingsForUser,
  groupMeetingHistory,
  computeMeetingStats,
} from "@/lib/services/meetingService";
import { processMeetingReminders } from "@/lib/services/meetingReminderService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withErrorHandler(async (request) => {
  const decodedToken = await requireAuth(request);
  const role = decodedToken.role;

  if (!["parent", "teacher", "institute", "admin"].includes(role)) {
    return jsonError("Forbidden: Invalid role for meeting history.", 403);
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitResult = await checkRateLimit(
    `meetings_history_${ip}_${decodedToken.uid}`
  );
  if (!rateLimitResult.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const db = await connectDb();
  await ensureMeetingIndexes(db);
  await processMeetingReminders(db);

  const meetings = await getMeetingsForUser(db, decodedToken.uid, role);
  const grouped = groupMeetingHistory(meetings);
  const stats = computeMeetingStats(meetings);

  return jsonSuccess({ ...grouped, stats, all: meetings });
});
