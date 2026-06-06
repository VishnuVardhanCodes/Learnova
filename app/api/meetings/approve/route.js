import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/error-handler";
import { requireRole } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDb } from "@/lib/mongodb";
import {
  ensureMeetingIndexes,
  approveMeeting,
} from "@/lib/services/meetingService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const PUT = withErrorHandler(async (request) => {
  const { payload: decodedToken } = await requireRole(request, [
    "teacher",
    "admin",
  ]);

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitResult = await checkRateLimit(
    `meetings_approve_${ip}_${decodedToken.uid}`
  );
  if (!rateLimitResult.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const { meetingId, teacherNotes } = await request.json();
  if (!meetingId) return jsonError("Meeting ID is required.", 400);

  const db = await connectDb();
  await ensureMeetingIndexes(db);

  try {
    const meeting = await approveMeeting(
      db,
      meetingId,
      decodedToken.uid,
      teacherNotes || ""
    );
    return jsonSuccess(meeting);
  } catch (err) {
    return jsonError(err.message || "Approval failed.", 400);
  }
});
