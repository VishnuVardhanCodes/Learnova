import { connectDb } from "@/lib/mongodb";
import { initFirebaseAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import {
  enrichPrediction,
  buildTeacherInterventions,
  buildDepartmentAnalytics,
} from "@/lib/services/predictionEnhancements";

export const PREDICTION_WEIGHTS = {
  attendance: 0.4,
  grades: 0.4,
  activities: 0.2,
};

export const RISK_LEVELS = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  AVERAGE: "Average",
  AT_RISK: "At Risk",
};

const COLLECTION = "student_predictions";
const LOOKBACK_DAYS = 90;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export function classifyRiskLevel(predictionScore) {
  const score = Number(predictionScore) || 0;
  if (score >= 85) return RISK_LEVELS.EXCELLENT;
  if (score >= 70) return RISK_LEVELS.GOOD;
  if (score >= 50) return RISK_LEVELS.AVERAGE;
  return RISK_LEVELS.AT_RISK;
}

export function calculatePredictionScore(
  attendanceScore,
  gradeScore,
  activityScore
) {
  const score =
    attendanceScore * PREDICTION_WEIGHTS.attendance +
    gradeScore * PREDICTION_WEIGHTS.grades +
    activityScore * PREDICTION_WEIGHTS.activities;
  return Math.round(Math.min(100, Math.max(0, score)));
}

export function generateRecommendations({
  attendanceScore,
  gradeScore,
  activityScore,
  predictionScore,
}) {
  const recommendations = [];

  if (attendanceScore < 75) {
    recommendations.push(
      "Student attendance is below 75%. Additional monitoring recommended."
    );
  }
  if (gradeScore < 70) {
    recommendations.push(
      "Student may require academic support sessions."
    );
  }
  if (activityScore < 50) {
    recommendations.push(
      "Encourage participation in extracurricular activities."
    );
  }
  if (predictionScore >= 85) {
    recommendations.push("Eligible for advanced learning opportunities.");
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Maintain consistent effort across attendance, grades, and activities."
    );
  }

  return recommendations;
}

function getLookbackDate() {
  const date = new Date();
  date.setDate(date.getDate() - LOOKBACK_DAYS);
  return date.toISOString().slice(0, 10);
}

async function fetchAttendanceMetrics(db, studentId, instituteId) {
  const match = { userId: studentId };
  if (instituteId) match.instituteId = instituteId;

  const since = getLookbackDate();
  match.date = { $gte: since };

  const records = await db
    .collection("attendance")
    .find(match)
    .project({ status: 1, date: 1 })
    .toArray();

  if (records.length === 0) {
    return {
      attendanceScore: 75,
      attendanceRate: 75,
      totalDays: 0,
      presentDays: 0,
      trend: "stable",
    };
  }

  const presentDays = records.filter((r) =>
    ["present", "late"].includes(r.status)
  ).length;
  const attendanceRate = Math.round((presentDays / records.length) * 100);

  const midpoint = Math.floor(records.length / 2);
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(midpoint);
  const prior = sorted.slice(0, midpoint);

  const rateOf = (list) => {
    if (!list.length) return attendanceRate;
    const present = list.filter((r) =>
      ["present", "late"].includes(r.status)
    ).length;
    return Math.round((present / list.length) * 100);
  };

  const recentRate = rateOf(recent);
  const priorRate = rateOf(prior);
  let trend = "stable";
  if (recentRate < priorRate - 5) trend = "declining";
  if (recentRate > priorRate + 5) trend = "improving";

  return {
    attendanceScore: attendanceRate,
    attendanceRate,
    totalDays: records.length,
    presentDays,
    trend,
  };
}

async function fetchGradeMetrics(studentId) {
  try {
    initFirebaseAdmin();
    const firestore = getFirestore();
    const snapshot = await firestore
      .collection("grades")
      .where("studentId", "==", studentId)
      .get();

    if (snapshot.empty) {
      const mongoDb = await connectDb();
      const mongoGrades = await mongoDb
        .collection("grades")
        .find({ studentId })
        .toArray();

      if (mongoGrades.length === 0) {
        return {
          gradeScore: 72,
          averageGrade: 72,
          subjectCount: 0,
          subjects: [],
        };
      }

      return computeGradeMetrics(mongoGrades);
    }

    const grades = snapshot.docs.map((doc) => doc.data());
    return computeGradeMetrics(grades);
  } catch {
    return {
      gradeScore: 72,
      averageGrade: 72,
      subjectCount: 0,
      subjects: [],
    };
  }
}

function computeGradeMetrics(grades) {
  const scored = grades.filter(
    (g) => typeof g.score === "number" && g.maxScore > 0
  );

  if (scored.length === 0) {
    return {
      gradeScore: 72,
      averageGrade: 72,
      subjectCount: grades.length,
      subjects: grades.map((g) => g.subject).filter(Boolean),
    };
  }

  const percentages = scored.map((g) =>
    Math.round((g.score / g.maxScore) * 100)
  );
  const averageGrade = Math.round(
    percentages.reduce((sum, p) => sum + p, 0) / percentages.length
  );

  const subjectMap = {};
  scored.forEach((g) => {
    if (!g.subject) return;
    const pct = Math.round((g.score / g.maxScore) * 100);
    if (!subjectMap[g.subject]) subjectMap[g.subject] = [];
    subjectMap[g.subject].push(pct);
  });

  const subjects = Object.entries(subjectMap).map(([subject, scores]) => ({
    subject,
    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  return {
    gradeScore: averageGrade,
    averageGrade,
    subjectCount: subjects.length || scored.length,
    subjects,
  };
}

async function fetchActivityMetrics(studentId) {
  try {
    initFirebaseAdmin();
    const firestore = getFirestore();
    const snapshot = await firestore
      .collection("activities")
      .where("userId", "==", studentId)
      .get();

    if (snapshot.empty) {
      return {
        activityScore: 50,
        participationCount: 0,
        completionRate: 0,
      };
    }

    const activities = snapshot.docs.map((doc) => doc.data());
    const participationCount = activities.length;
    const withProgress = activities.filter(
      (a) => typeof a.progress === "number"
    );
    const completionRate =
      withProgress.length > 0
        ? Math.round(
            withProgress.reduce((sum, a) => sum + a.progress, 0) /
              withProgress.length
          )
        : Math.min(100, participationCount * 10);

    const activityScore = Math.round(
      Math.min(100, participationCount * 8 + completionRate * 0.4)
    );

    return {
      activityScore,
      participationCount,
      completionRate,
    };
  } catch {
    return {
      activityScore: 50,
      participationCount: 0,
      completionRate: 0,
    };
  }
}

export async function collectStudentMetrics(studentId, instituteId = null) {
  const db = await connectDb();
  const [attendance, grades, activities] = await Promise.all([
    fetchAttendanceMetrics(db, studentId, instituteId),
    fetchGradeMetrics(studentId),
    fetchActivityMetrics(studentId),
  ]);

  return { attendance, grades, activities };
}

export function buildPredictionFromMetrics(studentId, metrics, extra = {}) {
  const { attendance, grades, activities } = metrics;
  const attendanceScore = attendance.attendanceScore;
  const gradeScore = grades.gradeScore;
  const activityScore = activities.activityScore;

  const predictionScore = calculatePredictionScore(
    attendanceScore,
    gradeScore,
    activityScore
  );
  const riskLevel = classifyRiskLevel(predictionScore);
  const recommendations = generateRecommendations({
    attendanceScore,
    gradeScore,
    activityScore,
    predictionScore,
  });

  return {
    studentId,
    instituteId: extra.instituteId || null,
    studentName: extra.studentName || null,
    email: extra.email || null,
    department: extra.department || null,
    className: extra.className || null,
    attendanceScore,
    gradeScore,
    activityScore,
    predictionScore,
    riskLevel,
    recommendations,
    attendanceAnalysis: {
      rate: attendance.attendanceRate,
      totalDays: attendance.totalDays,
      presentDays: attendance.presentDays,
      trend: attendance.trend,
    },
    gradeAnalysis: {
      average: grades.averageGrade,
      subjectCount: grades.subjectCount,
      subjects: grades.subjects,
    },
    activityAnalysis: {
      participationCount: activities.participationCount,
      completionRate: activities.completionRate,
    },
    generatedAt: new Date(),
  };
}

export async function getCachedPrediction(db, studentId) {
  const cached = await db.collection(COLLECTION).findOne(
    { studentId },
    { sort: { generatedAt: -1 } }
  );

  if (!cached) return null;

  const age = Date.now() - new Date(cached.generatedAt).getTime();
  if (age > CACHE_TTL_MS) return null;

  return cached;
}

export async function generateStudentPrediction(
  studentId,
  options = {}
) {
  const db = await connectDb();
  const { forceRefresh = false, instituteId = null, ...meta } = options;

  if (!forceRefresh) {
    const cached = await getCachedPrediction(db, studentId);
    if (cached) return cached;
  }

  const metrics = await collectStudentMetrics(studentId, instituteId);
  const prediction = buildPredictionFromMetrics(studentId, metrics, {
    instituteId,
    ...meta,
  });

  await db.collection(COLLECTION).updateOne(
    { studentId },
    { $set: prediction },
    { upsert: true }
  );

  if (prediction.predictionScore < 50) {
    await sendAtRiskNotifications(db, prediction);
  }

  return prediction;
}

async function sendAtRiskNotifications(db, prediction) {
  const message = `Performance alert: ${prediction.studentName || "Student"} prediction score is ${prediction.predictionScore} (${prediction.riskLevel}). Review recommended.`;
  const now = new Date();

  await db.collection("notifications").insertOne({
    userId: prediction.studentId,
    message,
    type: "prediction_alert",
    read: false,
    createdAt: now,
  });

  try {
    initFirebaseAdmin();
    const firestore = getFirestore();
    const links = await firestore
      .collection("parent_student_links")
      .where("studentId", "==", prediction.studentId)
      .get();

    const parentNotifications = links.docs.map((doc) => {
      const data = doc.data();
      return firestore.collection("notifications").add({
        recipientId: data.parentId,
        studentId: prediction.studentId,
        message: `Your child's academic performance needs attention. Current prediction score: ${prediction.predictionScore}.`,
        type: "prediction_alert",
        read: false,
        createdAt: now,
      });
    });

    await Promise.all(parentNotifications);

    if (prediction.instituteId) {
      const teachers = await firestore
        .collection("users")
        .where("instituteId", "==", prediction.instituteId)
        .where("role", "==", "teacher")
        .limit(20)
        .get();

      const teacherNotifications = teachers.docs.map((doc) =>
        db.collection("notifications").insertOne({
          userId: doc.id,
          message,
          type: "prediction_alert",
          read: false,
          createdAt: now,
        })
      );
      await Promise.all(teacherNotifications);
    }
  } catch (err) {
    console.warn("[predictionService] Notification dispatch failed:", err.message);
  }
}

export async function getStudentPrediction(studentId, options = {}) {
  const db = await connectDb();
  const cached = await getCachedPrediction(db, studentId);

  if (cached && !options.forceRefresh) {
    return formatPredictionResponse(cached);
  }

  const prediction = await generateStudentPrediction(studentId, options);
  return formatPredictionResponse(prediction);
}

export function formatPredictionResponse(doc) {
  const base = {
    predictionScore: doc.predictionScore,
    riskLevel: doc.riskLevel,
    attendanceScore: doc.attendanceScore,
    gradeScore: doc.gradeScore,
    activityScore: doc.activityScore,
    attendanceAnalysis: doc.attendanceAnalysis,
    gradeAnalysis: doc.gradeAnalysis,
    activityAnalysis: doc.activityAnalysis,
    recommendations: doc.recommendations || [],
    studentName: doc.studentName,
    studentId: doc.studentId,
    department: doc.department,
    className: doc.className,
    generatedAt: doc.generatedAt,
    performanceTrend: doc.attendanceAnalysis?.trend || "stable",
  };

  return enrichPrediction(base);
}

export async function getInstitutePredictions(instituteId) {
  const db = await connectDb();

  const students = await db
    .collection("attendance")
    .aggregate([
      { $match: { instituteId } },
      {
        $group: {
          _id: "$userId",
          studentName: { $last: "$studentName" },
          email: { $last: "$email" },
        },
      },
    ])
    .toArray();

  const predictions = await Promise.all(
    students.map(async (s) => {
      const prediction = await generateStudentPrediction(s._id, {
        instituteId,
        studentName: s.studentName,
        email: s.email,
      });
      return prediction;
    })
  );

  return buildInstituteSummary(predictions);
}

export function buildInstituteSummary(predictions) {
  const totalStudents = predictions.length;
  const riskDistribution = {
    Excellent: 0,
    Good: 0,
    Average: 0,
    "At Risk": 0,
  };

  let scoreSum = 0;
  predictions.forEach((p) => {
    riskDistribution[p.riskLevel] = (riskDistribution[p.riskLevel] || 0) + 1;
    scoreSum += p.predictionScore || 0;
  });

  const sorted = [...predictions].sort(
    (a, b) => b.predictionScore - a.predictionScore
  );

  const formattedStudents = sorted.map(formatPredictionResponse);
  const departmentAnalytics = buildDepartmentAnalytics(formattedStudents);
  const interventions = buildTeacherInterventions(formattedStudents);

  return {
    totalStudents,
    averagePredictionScore:
      totalStudents > 0 ? Math.round(scoreSum / totalStudents) : 0,
    riskDistribution,
    topPerformers: formattedStudents.slice(0, 5),
    atRiskStudents: formattedStudents.filter(
      (p) => p.riskLevel === RISK_LEVELS.AT_RISK
    ),
    students: formattedStudents,
    departmentAnalytics,
    interventions,
    studentsRequiringAttention:
      departmentAnalytics.studentsRequiringAttention,
    topPerformingDepartments:
      departmentAnalytics.topPerformingDepartments,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateAllPredictions(instituteId) {
  const summary = await getInstitutePredictions(instituteId);
  return {
    generated: summary.totalStudents,
    summary,
  };
}

export async function ensurePredictionIndexes(db) {
  try {
    await db.collection(COLLECTION).createIndex(
      { studentId: 1 },
      { background: true }
    );
    await db.collection(COLLECTION).createIndex(
      { instituteId: 1, riskLevel: 1 },
      { background: true }
    );
    await db.collection(COLLECTION).createIndex(
      { generatedAt: -1 },
      { background: true }
    );
  } catch {
    // best-effort
  }
}
