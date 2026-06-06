import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/error-handler";
import { requireRole } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDb } from "@/lib/mongodb";
import {
  generateAllPredictions,
  ensurePredictionIndexes,
} from "@/lib/services/predictionService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = withErrorHandler(async (request) => {
  const { payload: decodedToken, profile } = await requireRole(request, [
    "teacher",
    "institute",
    "admin",
  ]);

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimitResult = await checkRateLimit(
    `prediction_generate_${ip}_${decodedToken.uid}`
  );
  if (!rateLimitResult.allowed) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  if (!profile) {
    return jsonError("User profile not found", 404);
  }

  const instituteId = profile.instituteId || profile.uid;

  const db = await connectDb();
  await ensurePredictionIndexes(db);

  const result = await generateAllPredictions(instituteId);

  return jsonSuccess({
    message: `Generated predictions for ${result.generated} students.`,
    ...result,
  });
});
