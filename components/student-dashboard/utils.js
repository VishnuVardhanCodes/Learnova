export const MOTIVATIONAL_QUOTES = [
  "Small steps every day lead to big results.",
  "Your education is a dress rehearsal for a life of impact.",
  "Consistency beats intensity — keep showing up.",
  "Learning is a journey, not a race.",
  "Every class attended is an investment in your future.",
  "Progress, not perfection, is the goal.",
];

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getDailyQuote(date = new Date()) {
  const index = date.getDate() % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}

export function getSubjectPerformance(recentActivity = []) {
  const map = new Map();
  recentActivity.forEach((entry) => {
    const subject = entry.subject || "General";
    const current = map.get(subject) || { present: 0, total: 0 };
    const status = (entry.status || "").toLowerCase();
    map.set(subject, {
      present: current.present + (status === "present" || status === "late" ? 1 : 0),
      total: current.total + 1,
    });
  });

  if (!map.size) {
    return [
      { subject: "Mathematics", rate: 92, grade: "A" },
      { subject: "Computer Science", rate: 88, grade: "A-" },
      { subject: "Physics", rate: 76, grade: "B+" },
      { subject: "English", rate: 84, grade: "B+" },
    ];
  }

  return Array.from(map.entries()).map(([subject, data]) => {
    const rate = Math.round((data.present / Math.max(1, data.total)) * 100);
    return {
      subject,
      rate,
      grade: rate >= 90 ? "A" : rate >= 80 ? "B+" : rate >= 70 ? "B" : "C+",
    };
  });
}

export function computeGpa(subjects) {
  if (!subjects.length) return 3.6;
  const gradePoints = { A: 4, "A-": 3.7, "B+": 3.3, B: 3, "C+": 2.3 };
  const total = subjects.reduce((sum, s) => sum + (gradePoints[s.grade] || 3), 0);
  return Math.round((total / subjects.length) * 10) / 10;
}
