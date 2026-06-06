import { PREDICTION_WEIGHTS, classifyRiskLevel } from "./predictionService";
import { computePerformanceForecast } from "@/services/forecastService";

export function computeExplainableInsights(
  attendanceScore,
  gradeScore,
  activityScore,
  predictionScore
) {
  const attendanceContribution = Math.round(
    attendanceScore * PREDICTION_WEIGHTS.attendance
  );
  const gradesContribution = Math.round(gradeScore * PREDICTION_WEIGHTS.grades);
  const activitiesContribution = Math.round(
    activityScore * PREDICTION_WEIGHTS.activities
  );
  const totalContribution =
    attendanceContribution + gradesContribution + activitiesContribution || 1;

  return {
    predictionScore,
    attendance: {
      rawScore: attendanceScore,
      weight: PREDICTION_WEIGHTS.attendance,
      contribution: attendanceContribution,
      impactPercent: Math.round(
        (attendanceContribution / totalContribution) * 100
      ),
      label: "Attendance Contribution",
    },
    grades: {
      rawScore: gradeScore,
      weight: PREDICTION_WEIGHTS.grades,
      contribution: gradesContribution,
      impactPercent: Math.round((gradesContribution / totalContribution) * 100),
      label: "Grades Contribution",
    },
    activities: {
      rawScore: activityScore,
      weight: PREDICTION_WEIGHTS.activities,
      contribution: activitiesContribution,
      impactPercent: Math.round(
        (activitiesContribution / totalContribution) * 100
      ),
      label: "Activity Contribution",
    },
    breakdown: [
      {
        name: "Attendance",
        contribution: attendanceContribution,
        weight: `${Math.round(PREDICTION_WEIGHTS.attendance * 100)}%`,
        color: "#3b82f6",
      },
      {
        name: "Grades",
        contribution: gradesContribution,
        weight: `${Math.round(PREDICTION_WEIGHTS.grades * 100)}%`,
        color: "#8b5cf6",
      },
      {
        name: "Activities",
        contribution: activitiesContribution,
        weight: `${Math.round(PREDICTION_WEIGHTS.activities * 100)}%`,
        color: "#10b981",
      },
    ],
  };
}

export function generateImprovementRoadmap(
  prediction,
  targetScore = 90
) {
  const {
    predictionScore,
    attendanceScore,
    gradeScore,
    activityScore,
    attendanceAnalysis = {},
    gradeAnalysis = {},
    activityAnalysis = {},
  } = prediction;

  const actions = [];
  const gap = Math.max(0, targetScore - predictionScore);

  if (attendanceScore < 90) {
    actions.push({
      id: "attendance",
      text: "Increase attendance above 90%",
      current: `${attendanceScore}%`,
      target: "90%+",
      completed: attendanceScore >= 90,
      priority: attendanceScore < 75 ? "high" : "medium",
      estimatedImpact: Math.round((90 - attendanceScore) * PREDICTION_WEIGHTS.attendance * 0.5),
    });
  }

  const subjects = gradeAnalysis.subjects || [];
  const weakest = [...subjects].sort((a, b) => a.average - b.average)[0];
  if (weakest && weakest.average < 80) {
    const targetMarks = Math.min(100, weakest.average + 10);
    actions.push({
      id: `grade-${weakest.subject}`,
      text: `Improve ${weakest.subject} score by 10 marks`,
      current: `${weakest.average}%`,
      target: `${targetMarks}%`,
      completed: weakest.average >= 80,
      priority: weakest.average < 60 ? "high" : "medium",
      estimatedImpact: 4,
    });
  } else if (gradeScore < 80) {
    actions.push({
      id: "grades-general",
      text: "Improve overall grades by 10 marks",
      current: `${gradeScore}%`,
      target: `${Math.min(100, gradeScore + 10)}%`,
      completed: gradeScore >= 80,
      priority: "medium",
      estimatedImpact: 4,
    });
  }

  const participation = activityAnalysis.participationCount || 0;
  const targetActivities = participation + 2;
  if (participation < 8) {
    actions.push({
      id: "activities",
      text: "Participate in 2 additional activities",
      current: `${participation} activities`,
      target: `${targetActivities} activities`,
      completed: participation >= 8,
      priority: activityScore < 50 ? "high" : "low",
      estimatedImpact: 3,
    });
  }

  if (attendanceAnalysis.trend === "declining") {
    actions.push({
      id: "attendance-trend",
      text: "Reverse declining attendance trend",
      current: "Declining",
      target: "Stable or improving",
      completed: false,
      priority: "high",
      estimatedImpact: 5,
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "maintain",
      text: "Maintain current performance levels",
      current: `${predictionScore}`,
      target: `${targetScore}`,
      completed: predictionScore >= targetScore,
      priority: "low",
      estimatedImpact: 0,
    });
  }

  const projectedScore = Math.min(
    100,
    predictionScore + actions.reduce((sum, a) => sum + (a.estimatedImpact || 0), 0)
  );

  return {
    currentStatus: {
      predictionScore,
      riskLevel: prediction.riskLevel,
      attendance: attendanceScore,
      grades: gradeScore,
      activities: activityScore,
    },
    targetStatus: {
      predictionScore: targetScore,
      riskLevel: classifyRiskLevel(targetScore),
      projectedScore,
    },
    gap,
    actions,
    summary:
      gap > 0
        ? `To improve your prediction score from ${predictionScore} to ${targetScore}:`
        : `You are on track to meet the target score of ${targetScore}.`,
  };
}

export function buildInterventionForStudent(student) {
  const reasons = [];
  const interventions = [];

  if (student.attendanceScore < 65) {
    reasons.push("Attendance below 65%");
    interventions.push("Schedule parent meeting");
  } else if (student.attendanceScore < 75) {
    reasons.push("Attendance below 75%");
    interventions.push("Send attendance reminder to family");
  }

  if (student.gradeScore < 60) {
    reasons.push("Grades critically low");
    interventions.push("Assign remedial tutoring sessions");
  } else if (student.gradeScore < 70) {
    reasons.push("Below-average academic performance");
    interventions.push("Provide academic support sessions");
  }

  if (student.activityScore < 40) {
    reasons.push("Low extracurricular participation");
    interventions.push("Encourage activity enrollment");
  }

  if (student.performanceTrend === "declining") {
    reasons.push("Performance trend is declining");
    interventions.push("Conduct one-on-one progress review");
  }

  if (reasons.length === 0 && student.riskLevel === "Excellent") {
    reasons.push("Strong overall performance");
    interventions.push("Offer advanced learning opportunities");
  }

  if (reasons.length === 0) {
    reasons.push("Moderate performance across metrics");
    interventions.push("Monitor progress weekly");
  }

  return {
    studentId: student.studentId,
    studentName: student.studentName || student.studentId,
    riskLevel: student.riskLevel,
    predictionScore: student.predictionScore,
    reasons,
    suggestedIntervention: interventions[0],
    allInterventions: interventions,
    performanceTrend: student.performanceTrend || "stable",
    category: categorizeIntervention(student),
  };
}

function categorizeIntervention(student) {
  if (student.riskLevel === "At Risk") return "high";
  if (student.riskLevel === "Average") return "medium";
  if (student.performanceTrend === "improving") return "improving";
  return "stable";
}

export function buildTeacherInterventions(students = []) {
  const enriched = students.map(buildInterventionForStudent);

  return {
    highRisk: enriched.filter((s) => s.category === "high"),
    mediumRisk: enriched.filter((s) => s.category === "medium"),
    improving: enriched.filter((s) => s.category === "improving"),
    total: enriched.length,
  };
}

export function generateParentGuidance(prediction) {
  const {
    predictionScore,
    attendanceScore,
    gradeScore,
    activityScore,
    gradeAnalysis = {},
    attendanceAnalysis = {},
  } = prediction;

  const guidance = [];

  if (attendanceScore < 75 || attendanceAnalysis.trend === "declining") {
    guidance.push("Help your child improve attendance consistency — regular school presence makes a big difference.");
  } else {
    guidance.push("Your child's attendance is on track — keep encouraging punctual school attendance.");
  }

  if (activityScore < 50) {
    guidance.push("Encourage participation in school activities to build confidence and engagement.");
  } else {
    guidance.push("Continue supporting your child's involvement in school activities.");
  }

  const weakSubjects = (gradeAnalysis.subjects || [])
    .filter((s) => s.average < 70)
    .map((s) => s.subject);

  if (weakSubjects.length > 0) {
    guidance.push(
      `Focus extra study time on ${weakSubjects.slice(0, 3).join(" and ")}.`
    );
  } else if (gradeScore < 70) {
    guidance.push("Consider additional study support to help improve academic grades.");
  } else {
    guidance.push("Academic performance looks healthy — praise effort and maintain study routines.");
  }

  const tone =
    predictionScore >= 85
      ? "Your child is performing excellently."
      : predictionScore >= 70
        ? "Your child is doing well overall."
        : predictionScore >= 50
          ? "Your child is making progress but could use extra support."
          : "Your child needs additional support to improve their performance.";

  return {
    headline: `Your child has a prediction score of ${predictionScore}.`,
    tone,
    recommendations: guidance,
    focusAreas: {
      attendance: attendanceScore < 75,
      grades: gradeScore < 70,
      activities: activityScore < 50,
    },
  };
}

export function buildDepartmentAnalytics(predictions = []) {
  const deptMap = {};

  predictions.forEach((p) => {
    const dept = p.department || "General";
    if (!deptMap[dept]) {
      deptMap[dept] = { department: dept, scores: [], count: 0, atRisk: 0 };
    }
    deptMap[dept].scores.push(p.predictionScore || 0);
    deptMap[dept].count += 1;
    if (p.riskLevel === "At Risk") deptMap[dept].atRisk += 1;
  });

  const departments = Object.values(deptMap)
    .map((d) => ({
      department: d.department,
      averageScore: Math.round(
        d.scores.reduce((a, b) => a + b, 0) / d.scores.length
      ),
      studentCount: d.count,
      atRiskCount: d.atRisk,
    }))
    .sort((a, b) => b.averageScore - a.averageScore);

  return {
    departments,
    topPerformingDepartments: departments.slice(0, 3),
    studentsRequiringAttention: predictions
      .filter(
        (p) =>
          p.riskLevel === "At Risk" ||
          (p.riskLevel === "Average" && p.performanceTrend === "declining")
      )
      .slice(0, 10),
  };
}

export function enrichPrediction(prediction) {
  const explainable = computeExplainableInsights(
    prediction.attendanceScore,
    prediction.gradeScore,
    prediction.activityScore,
    prediction.predictionScore
  );

  const roadmap = generateImprovementRoadmap(prediction);
  const forecast = computePerformanceForecast({
    predictionScore: prediction.predictionScore,
    attendanceAnalysis: prediction.attendanceAnalysis,
    gradeAnalysis: prediction.gradeAnalysis,
    activityAnalysis: prediction.activityAnalysis,
  });
  const parentGuidance = generateParentGuidance(prediction);
  const intervention = buildInterventionForStudent({
    ...prediction,
    performanceTrend: prediction.attendanceAnalysis?.trend || "stable",
  });

  return {
    ...prediction,
    explainable,
    roadmap,
    forecast,
    parentGuidance,
    intervention,
  };
}
