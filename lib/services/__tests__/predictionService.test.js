import { describe, it, expect } from "vitest";
import {
  calculatePredictionScore,
  classifyRiskLevel,
  generateRecommendations,
  buildPredictionFromMetrics,
  buildInstituteSummary,
  PREDICTION_WEIGHTS,
  RISK_LEVELS,
} from "../predictionService";

describe("predictionService", () => {
  describe("calculatePredictionScore", () => {
    it("applies weighted formula correctly", () => {
      const score = calculatePredictionScore(80, 90, 60);
      const expected =
        80 * PREDICTION_WEIGHTS.attendance +
        90 * PREDICTION_WEIGHTS.grades +
        60 * PREDICTION_WEIGHTS.activities;
      expect(score).toBe(Math.round(expected));
    });

    it("clamps score between 0 and 100", () => {
      expect(calculatePredictionScore(150, 150, 150)).toBe(100);
      expect(calculatePredictionScore(-10, -10, -10)).toBe(0);
    });
  });

  describe("classifyRiskLevel", () => {
    it("classifies Excellent for 85-100", () => {
      expect(classifyRiskLevel(85)).toBe(RISK_LEVELS.EXCELLENT);
      expect(classifyRiskLevel(100)).toBe(RISK_LEVELS.EXCELLENT);
    });

    it("classifies Good for 70-84", () => {
      expect(classifyRiskLevel(70)).toBe(RISK_LEVELS.GOOD);
      expect(classifyRiskLevel(84)).toBe(RISK_LEVELS.GOOD);
    });

    it("classifies Average for 50-69", () => {
      expect(classifyRiskLevel(50)).toBe(RISK_LEVELS.AVERAGE);
      expect(classifyRiskLevel(69)).toBe(RISK_LEVELS.AVERAGE);
    });

    it("classifies At Risk below 50", () => {
      expect(classifyRiskLevel(49)).toBe(RISK_LEVELS.AT_RISK);
      expect(classifyRiskLevel(0)).toBe(RISK_LEVELS.AT_RISK);
    });
  });

  describe("generateRecommendations", () => {
    it("includes low attendance recommendation", () => {
      const recs = generateRecommendations({
        attendanceScore: 60,
        gradeScore: 80,
        activityScore: 70,
        predictionScore: 70,
      });
      expect(recs.some((r) => r.includes("attendance"))).toBe(true);
    });

    it("includes high performer recommendation", () => {
      const recs = generateRecommendations({
        attendanceScore: 90,
        gradeScore: 90,
        activityScore: 85,
        predictionScore: 88,
      });
      expect(recs.some((r) => r.includes("advanced learning"))).toBe(true);
    });
  });

  describe("buildPredictionFromMetrics", () => {
    it("builds complete prediction document", () => {
      const prediction = buildPredictionFromMetrics("student-1", {
        attendance: {
          attendanceScore: 85,
          attendanceRate: 85,
          totalDays: 20,
          presentDays: 17,
          trend: "stable",
        },
        grades: {
          gradeScore: 78,
          averageGrade: 78,
          subjectCount: 3,
          subjects: [{ subject: "Math", average: 78 }],
        },
        activities: {
          activityScore: 65,
          participationCount: 5,
          completionRate: 70,
        },
      });

      expect(prediction.studentId).toBe("student-1");
      expect(prediction.predictionScore).toBeGreaterThan(0);
      expect(prediction.riskLevel).toBeTruthy();
      expect(prediction.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("buildInstituteSummary", () => {
    it("aggregates risk distribution", () => {
      const summary = buildInstituteSummary([
        {
          studentId: "a",
          predictionScore: 90,
          riskLevel: RISK_LEVELS.EXCELLENT,
          attendanceScore: 90,
          gradeScore: 90,
          activityScore: 80,
        },
        {
          studentId: "b",
          predictionScore: 40,
          riskLevel: RISK_LEVELS.AT_RISK,
          attendanceScore: 40,
          gradeScore: 40,
          activityScore: 40,
        },
      ]);

      expect(summary.totalStudents).toBe(2);
      expect(summary.riskDistribution.Excellent).toBe(1);
      expect(summary.riskDistribution["At Risk"]).toBe(1);
      expect(summary.atRiskStudents).toHaveLength(1);
      expect(summary.topPerformers[0].studentId).toBe("a");
    });
  });
});
