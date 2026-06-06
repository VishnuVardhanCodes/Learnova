import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/error-handler";
import { requireAuth } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDb } from "@/lib/mongodb";
import {
  ensureMeetingIndexes,
  cancelMeeting,
} from "@/lib/services/meetingService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const DELETE = withErrorHandler(async (request) => {
  const decodedToken = await requireAuth(request);
  const role = decodedToken.role;

  if (!["parent", "teacher", "institute", "admin"].includes(role)) {
    return jsonError("Forbidden.", 403);
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitResult = await checkRateLimit(
    `meetings_cancel_${ip}_${decodedToken.uid}`
  );
  if (!rateLimitResult.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const { meetingId } = await request.json();
  if (!meetingId) return jsonError("Meeting ID is required.", 400);

  const db = await connectDb();
  await ensureMeetingIndexes(db);

  try {
    const meeting = await cancelMeeting(
      db,
      meetingId,
      decodedToken.uid,
      role
    );
    return jsonSuccess(meeting);
  } catch (err) {
    return jsonError(err.message || "Cancellation failed.", 400);
  }
});
