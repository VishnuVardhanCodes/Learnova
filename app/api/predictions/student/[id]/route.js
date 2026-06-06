import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/error-handler";
import { requireAuth } from "@/lib/rbac";
import { ForbiddenError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDb } from "@/lib/mongodb";
import {
  getStudentPrediction,
  ensurePredictionIndexes,
} from "@/lib/services/predictionService";
import { initFirebaseAdmin, getUserProfile } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function canAccessStudent(requester, studentId, profile) {
  if (requester.uid === studentId) return true;

  const role = requester.role;

  if (role === "parent") {
    try {
      initFirebaseAdmin();
      const firestore = getFirestore();
      const linkId = `${requester.uid}_${studentId}`;
      const link = await firestore
        .collection("parent_student_links")
        .doc(linkId)
        .get();
      return link.exists;
    } catch {
      return false;
    }
  }

  if (["teacher", "institute", "admin"].includes(role)) {
    const studentProfile = await getUserProfile(studentId);
    if (!studentProfile) return role === "admin";
    const instituteId = profile?.instituteId || profile?.uid;
    return (
      role === "admin" ||
      !studentProfile.instituteId ||
      studentProfile.instituteId === instituteId
    );
  }

  return false;
}

export const GET = withErrorHandler(async (request, context) => {
  const decodedToken = await requireAuth(request);
  const { id: studentId } = await context.params;

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitResult = await checkRateLimit(
    `prediction_student_${ip}_${decodedToken.uid}`
  );
  if (!rateLimitResult.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const profile = await getUserProfile(decodedToken.uid);
  const allowed = await canAccessStudent(decodedToken, studentId, profile);

  if (!allowed) {
    throw new ForbiddenError(
      "You are not authorized to view this student's predictions."
    );
  }

  const db = await connectDb();
  await ensurePredictionIndexes(db);

  const instituteId = profile?.instituteId || profile?.uid || null;
  const forceRefresh =
    new URL(request.url).searchParams.get("refresh") === "true";

  const prediction = await getStudentPrediction(studentId, {
    instituteId,
    forceRefresh,
    studentName: profile?.fullName,
  });

  return jsonSuccess(prediction);
});
