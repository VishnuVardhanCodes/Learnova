/**
 * Performance forecasting based on attendance, grade, and activity trends.
 * Used by predictionService (server) and UI components (client).
 */

const TREND_DELTAS = {
  improving: { monthly: 4, semester: 12 },
  declining: { monthly: -5, semester: -10 },
  stable: { monthly: 2, semester: 6 },
};

function clampScore(score) {
  return Math.round(Math.min(100, Math.max(0, score)));
}

function resolveTrend(attendanceTrend, gradeSubjects = []) {
  if (attendanceTrend === "improving" || attendanceTrend === "declining") {
    return attendanceTrend;
  }
  if (gradeSubjects.length >= 2) {
    const mid = Math.floor(gradeSubjects.length / 2);
    const recentAvg =
      gradeSubjects.slice(mid).reduce((s, g) => s + g.average, 0) /
      Math.max(1, gradeSubjects.length - mid);
    const priorAvg =
      gradeSubjects.slice(0, mid).reduce((s, g) => s + g.average, 0) /
      Math.max(1, mid);
    if (recentAvg > priorAvg + 3) return "improving";
    if (recentAvg < priorAvg - 3) return "declining";
  }
  return attendanceTrend || "stable";
}

/**
 * @param {object} input
 * @param {number} input.predictionScore
 * @param {object} [input.attendanceAnalysis]
 * @param {object} [input.gradeAnalysis]
 * @param {object} [input.activityAnalysis]
 */
export function computePerformanceForecast({
  predictionScore = 0,
  attendanceAnalysis = {},
  gradeAnalysis = {},
  activityAnalysis = {},
}) {
  const trend = resolveTrend(
    attendanceAnalysis.trend,
    gradeAnalysis.subjects || []
  );
  const deltas = TREND_DELTAS[trend] || TREND_DELTAS.stable;

  let activityBonus = 0;
  const participation = activityAnalysis.participationCount || 0;
  if (participation >= 5) activityBonus += 2;
  if (participation >= 10) activityBonus += 2;
  if ((activityAnalysis.completionRate || 0) >= 80) activityBonus += 1;

  const thirtyDayForecast = clampScore(predictionScore + deltas.monthly + activityBonus * 0.5);
  const semesterEndForecast = clampScore(
    predictionScore + deltas.semester + activityBonus
  );

  return {
    current: predictionScore,
    thirtyDay: thirtyDayForecast,
    semesterEnd: semesterEndForecast,
    trend,
    confidence:
      trend === "stable"
        ? "medium"
        : trend === "improving"
          ? "high"
          : "moderate",
    drivers: buildForecastDrivers(attendanceAnalysis, gradeAnalysis, activityAnalysis, trend),
  };
}

function buildForecastDrivers(attendance, grades, activities, trend) {
  const drivers = [];
  if (attendance.trend) {
    drivers.push({
      factor: "Attendance",
      trend: attendance.trend,
      impact: trend === "improving" ? "positive" : trend === "declining" ? "negative" : "neutral",
    });
  }
  if (grades.subjects?.length) {
    drivers.push({
      factor: "Grades",
      trend: grades.subjects.length >= 2 ? trend : "stable",
      impact: trend === "improving" ? "positive" : trend === "declining" ? "negative" : "neutral",
    });
  }
  if (activities.participationCount > 0) {
    drivers.push({
      factor: "Activities",
      trend: activities.participationCount >= 5 ? "improving" : "stable",
      impact: activities.participationCount >= 5 ? "positive" : "neutral",
    });
  }
  return drivers;
}

export function formatForecastLabel(forecast) {
  return {
    current: `${forecast.current}`,
    thirtyDay: `${forecast.thirtyDay}`,
    semesterEnd: `${forecast.semesterEnd}`,
  };
}
