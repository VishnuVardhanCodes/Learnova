import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/error-handler";
import { requireRole } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDb } from "@/lib/mongodb";
import {
  getInstitutePredictions,
  ensurePredictionIndexes,
} from "@/lib/services/predictionService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withErrorHandler(async (request) => {
  const { payload: decodedToken, profile } = await requireRole(request, [
    "teacher",
    "institute",
    "admin",
  ]);

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitResult = await checkRateLimit(
    `prediction_institute_${ip}_${decodedToken.uid}`
  );
  if (!rateLimitResult.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  if (!profile) {
    return jsonError("User profile not found", 404);
  }

  const instituteId = profile.instituteId || profile.uid;
  const { searchParams } = new URL(request.url);
  const riskFilter = searchParams.get("riskLevel");
  const classFilter = searchParams.get("class");
  const departmentFilter = searchParams.get("department");

  const db = await connectDb();
  await ensurePredictionIndexes(db);

  let summary = await getInstitutePredictions(instituteId);

  if (riskFilter && riskFilter !== "all") {
    summary = {
      ...summary,
      students: summary.students.filter((s) => s.riskLevel === riskFilter),
      atRiskStudents: summary.atRiskStudents.filter(
        (s) => s.riskLevel === riskFilter
      ),
    };
  }

  if (classFilter) {
    summary = {
      ...summary,
      students: summary.students.filter((s) => s.className === classFilter),
    };
  }

  if (departmentFilter) {
    summary = {
      ...summary,
      students: summary.students.filter(
        (s) => s.department === departmentFilter
      ),
    };
  }

  return jsonSuccess(summary);
});
