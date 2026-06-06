import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/error-handler";
import { requireAuth } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rateLimit";
import { getTeachersForInstitute } from "@/lib/services/meetingService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withErrorHandler(async (request) => {
  const decodedToken = await requireAuth(request);

  if (!["parent", "teacher", "institute", "admin"].includes(decodedToken.role)) {
    return jsonError("Forbidden.", 403);
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitResult = await checkRateLimit(
    `meetings_teachers_${ip}_${decodedToken.uid}`
  );
  if (!rateLimitResult.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const { searchParams } = new URL(request.url);
  const instituteId = searchParams.get("instituteId");

  if (!instituteId) {
    return jsonError("instituteId is required.", 400);
  }

  const teachers = await getTeachersForInstitute(instituteId);
  return jsonSuccess(teachers);
});
