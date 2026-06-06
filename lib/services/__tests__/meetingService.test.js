import { describe, it, expect } from "vitest";
import {
  timeToMinutes,
  minutesToTime,
  isPastDate,
  isPastDateTime,
  generateTimeSlots,
  groupMeetingHistory,
  computeMeetingStats,
  getDayNameFromDate,
  MEETING_STATUS,
} from "../meetingService";

describe("meetingService", () => {
  describe("time helpers", () => {
    it("converts time to minutes", () => {
      expect(timeToMinutes("09:30")).toBe(570);
      expect(minutesToTime(570)).toBe("09:30");
    });

    it("detects past dates", () => {
      expect(isPastDate("2000-01-01")).toBe(true);
      expect(isPastDate("2099-12-31")).toBe(false);
    });

    it("detects past date-time", () => {
      expect(isPastDateTime("2000-01-01", "10:00")).toBe(true);
    });

    it("gets day name from date", () => {
      expect(getDayNameFromDate("2026-06-08")).toBe("Monday");
    });
  });

  describe("generateTimeSlots", () => {
    it("generates 30-minute slots excluding booked", () => {
      const slots = generateTimeSlots(
        { day: "Monday", slots: [{ startTime: "09:00", endTime: "10:00" }] },
        [{ startTime: "09:00", endTime: "09:30" }]
      );
      expect(slots).toHaveLength(1);
      expect(slots[0].startTime).toBe("09:30");
    });
  });

  describe("groupMeetingHistory", () => {
    it("groups meetings by status and date", () => {
      const today = new Date().toISOString().slice(0, 10);
      const grouped = groupMeetingHistory([
        {
          status: MEETING_STATUS.PENDING,
          meetingDate: today,
        },
        {
          status: MEETING_STATUS.COMPLETED,
          meetingDate: "2020-01-01",
        },
        {
          status: MEETING_STATUS.CANCELLED,
          meetingDate: today,
        },
      ]);

      expect(grouped.pending).toHaveLength(1);
      expect(grouped.completed).toHaveLength(1);
      expect(grouped.cancelled).toHaveLength(1);
      expect(grouped.upcoming.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("computeMeetingStats", () => {
    it("computes stats from meetings list", () => {
      const stats = computeMeetingStats([
        { status: MEETING_STATUS.PENDING, meetingDate: "2099-01-01" },
        { status: MEETING_STATUS.COMPLETED, meetingDate: "2020-01-01" },
      ]);
      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.completed).toBe(1);
    });
  });
});
