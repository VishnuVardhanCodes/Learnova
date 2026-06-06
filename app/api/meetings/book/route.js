import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/error-handler";
import { requireRole } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDb } from "@/lib/mongodb";
import { getUserProfile } from "@/lib/firebase-admin";
import {
  ensureMeetingIndexes,
  bookMeeting,
  verifyParentStudentLink,
} from "@/lib/services/meetingService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = withErrorHandler(async (request) => {
  const { payload: decodedToken, profile } = await requireRole(request, [
    "parent",
    "admin",
  ]);

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitResult = await checkRateLimit(
    `meetings_book_${ip}_${decodedToken.uid}`
  );
  if (!rateLimitResult.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const body = await request.json();
  const {
    teacherId,
    teacherName,
    instituteId,
    studentId,
    studentName,
    meetingTitle,
    meetingReason,
    meetingDate,
    startTime,
    endTime,
  } = body;

  if (
    !teacherId ||
    !meetingDate ||
    !startTime ||
    !endTime ||
    !meetingTitle?.trim()
  ) {
    return jsonError("Missing required booking fields.", 400);
  }

  if (studentId) {
    const linked = await verifyParentStudentLink(decodedToken.uid, studentId);
    if (!linked) {
      return jsonError("You are not linked to this student.", 403);
    }
  }

  const db = await connectDb();
  await ensureMeetingIndexes(db);

  const parentName =
    profile?.fullName || profile?.name || decodedToken.name || "Parent";

  try {
    const meeting = await bookMeeting(db, {
      parentId: decodedToken.uid,
      parentName,
      teacherId,
      teacherName: teacherName || "Teacher",
      instituteId: instituteId || profile?.instituteId,
      studentId,
      studentName,
      meetingTitle: meetingTitle.trim(),
      meetingReason: meetingReason?.trim() || "",
      meetingDate,
      startTime,
      endTime,
    });

    return jsonSuccess(meeting, 201);
  } catch (err) {
    return jsonError(err.message || "Booking failed.", 400);
  }
});
