import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/error-handler";
import { requireAuth } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDb } from "@/lib/mongodb";
import { getUserProfile } from "@/lib/firebase-admin";
import {
  ensureMeetingIndexes,
  getTeacherAvailability,
  saveTeacherAvailability,
  getAvailableSlots,
  DAYS_OF_WEEK,
} from "@/lib/services/meetingService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withErrorHandler(async (request) => {
  const decodedToken = await requireAuth(request);
  const role = decodedToken.role;

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitResult = await checkRateLimit(
    `meetings_availability_get_${ip}_${decodedToken.uid}`
  );
  if (!rateLimitResult.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const db = await connectDb();
  await ensureMeetingIndexes(db);

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");
  const meetingDate = searchParams.get("meetingDate");

  if (teacherId && meetingDate) {
    const slots = await getAvailableSlots(db, teacherId, meetingDate);
    return jsonSuccess({ slots, meetingDate, teacherId });
  }

  if (role === "teacher") {
    const availability = await getTeacherAvailability(db, decodedToken.uid);
    return jsonSuccess(availability);
  }

  if (teacherId) {
    const availability = await getTeacherAvailability(db, teacherId);
    return jsonSuccess(availability);
  }

  return jsonError("teacherId or teacher role required.", 400);
});

export const PUT = withErrorHandler(async (request) => {
  const decodedToken = await requireAuth(request);

  if (decodedToken.role !== "teacher" && decodedToken.role !== "admin") {
    return jsonError("Only teachers can manage availability.", 403);
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitResult = await checkRateLimit(
    `meetings_availability_put_${ip}_${decodedToken.uid}`
  );
  if (!rateLimitResult.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const { schedule } = await request.json();
  if (!Array.isArray(schedule)) {
    return jsonError("Schedule must be an array.", 400);
  }

  for (const day of schedule) {
    if (!DAYS_OF_WEEK.includes(day.day)) {
      return jsonError(`Invalid day: ${day.day}`, 400);
    }
    for (const slot of day.slots || []) {
      if (!slot.startTime || !slot.endTime) {
        return jsonError("Each slot requires startTime and endTime.", 400);
      }
    }
  }

  const db = await connectDb();
  await ensureMeetingIndexes(db);
  const profile = await getUserProfile(decodedToken.uid);
  const instituteId = profile?.instituteId || profile?.uid;

  const availability = await saveTeacherAvailability(
    db,
    decodedToken.uid,
    instituteId,
    schedule
  );

  return jsonSuccess(availability);
});
