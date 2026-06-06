import { describe, it, expect } from "vitest";
import {
  computeExplainableInsights,
  generateImprovementRoadmap,
  buildTeacherInterventions,
  generateParentGuidance,
  buildDepartmentAnalytics,
  enrichPrediction,
} from "../predictionEnhancements";

const samplePrediction = {
  studentId: "s1",
  studentName: "Rahul",
  predictionScore: 78,
  riskLevel: "Good",
  attendanceScore: 85,
  gradeScore: 72,
  activityScore: 40,
  attendanceAnalysis: { rate: 85, trend: "stable" },
  gradeAnalysis: {
    average: 72,
    subjects: [
      { subject: "Mathematics", average: 62 },
      { subject: "Science", average: 78 },
    ],
  },
  activityAnalysis: { participationCount: 3, completionRate: 50 },
};

describe("predictionEnhancements", () => {
  describe("computeExplainableInsights", () => {
    it("calculates weighted contributions", () => {
      const result = computeExplainableInsights(80, 90, 60, 78);
      expect(result.attendance.contribution).toBe(32);
      expect(result.grades.contribution).toBe(36);
      expect(result.activities.contribution).toBe(12);
      expect(result.breakdown).toHaveLength(3);
    });
  });

  describe("generateImprovementRoadmap", () => {
    it("generates actionable roadmap items", () => {
      const roadmap = generateImprovementRoadmap(samplePrediction);
      expect(roadmap.currentStatus.predictionScore).toBe(78);
      expect(roadmap.targetStatus.predictionScore).toBe(90);
      expect(roadmap.actions.length).toBeGreaterThan(0);
      expect(roadmap.summary).toContain("78");
    });
  });

  describe("buildTeacherInterventions", () => {
    it("categorizes students by risk", () => {
      const students = [
        { ...samplePrediction, riskLevel: "At Risk", attendanceScore: 50 },
        { ...samplePrediction, studentId: "s2", riskLevel: "Average" },
        {
          ...samplePrediction,
          studentId: "s3",
          riskLevel: "Good",
          performanceTrend: "improving",
        },
      ];
      const result = buildTeacherInterventions(students);
      expect(result.highRisk.length).toBeGreaterThan(0);
      expect(result.highRisk[0].suggestedIntervention).toBeTruthy();
      expect(result.highRisk[0].reasons.length).toBeGreaterThan(0);
    });
  });

  describe("generateParentGuidance", () => {
    it("returns simple-language recommendations", () => {
      const guidance = generateParentGuidance(samplePrediction);
      expect(guidance.headline).toContain("78");
      expect(guidance.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("buildDepartmentAnalytics", () => {
    it("aggregates department scores", () => {
      const analytics = buildDepartmentAnalytics([
        { ...samplePrediction, department: "Science", predictionScore: 80 },
        { ...samplePrediction, department: "Science", predictionScore: 90, riskLevel: "Excellent" },
        { ...samplePrediction, department: "Arts", predictionScore: 50, riskLevel: "At Risk" },
      ]);
      expect(analytics.departments).toHaveLength(2);
      expect(analytics.topPerformingDepartments[0].department).toBe("Science");
      expect(analytics.studentsRequiringAttention.length).toBeGreaterThan(0);
    });
  });

  describe("enrichPrediction", () => {
    it("adds all enhancement fields", () => {
      const enriched = enrichPrediction(samplePrediction);
      expect(enriched.explainable).toBeTruthy();
      expect(enriched.roadmap).toBeTruthy();
      expect(enriched.forecast).toBeTruthy();
      expect(enriched.parentGuidance).toBeTruthy();
      expect(enriched.intervention).toBeTruthy();
    });
  });
});
