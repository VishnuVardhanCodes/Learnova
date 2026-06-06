"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Camera,
  Shield,
} from "lucide-react";

import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import ChartSkeleton from "@/components/ui/ChartSkeleton";
import { Navbar } from "./Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useAttendance } from "@/hooks/useAttendance";
import { useCurriculum } from "@/hooks/useCurriculum";
import { useIsMounted } from "@/hooks/useIsMounted";
import { weeklySchedule } from "@/constants/mockData";
import AttendanceInsights from "@/components/AttendanceInsights";
import ExportDropdown from "@/components/ui/ExportDropdown";
import { exportToCSV, exportToPDF } from "@/utils/exportUtils";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/apiClient";

import WelcomeSection from "@/components/student-dashboard/WelcomeSection";
import AnalyticsOverviewCards from "@/components/student-dashboard/AnalyticsOverviewCards";
import AttendanceProgressSection from "@/components/student-dashboard/AttendanceProgressSection";
import AcademicProgressSection from "@/components/student-dashboard/AcademicProgressSection";
import ActivityCenterWidget from "@/components/student-dashboard/ActivityCenterWidget";
import AchievementShowcase from "@/components/student-dashboard/AchievementShowcase";
import QuickActionsSection from "@/components/student-dashboard/QuickActionsSection";

const AttendanceAnalytics = dynamic(
  () => import("@/components/dashboard/AttendanceAnalytics"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const StreakCounter = dynamic(
  () => import("@/components/gamification/StreakCounter"),
  { ssr: false }
);

const XpProgressBar = dynamic(
  () => import("@/components/gamification/XpProgressBar"),
  { ssr: false }
);

const BadgeGallery = dynamic(
  () => import("@/components/gamification/BadgeGallery"),
  { ssr: false }
);

const ComplaintForm = dynamic(() => import("@/components/ComplaintForm"), {
  ssr: false,
});

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const ATTENDANCE_WINDOW_START_HOUR = 9;
const ATTENDANCE_WINDOW_END_MINUTE = 10;

const getUserInitials = (user) => {
  if (!user?.displayName && !user?.email) return "U";
  return (
    user?.displayName
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U"
  );
};

const getDayName = (dayIndex) => DAY_NAMES[dayIndex] || DAY_NAMES[0];
const isWeekday = (dayIndex) => dayIndex >= 1 && dayIndex <= 5;

const parseClassStartTime = (time = "") => {
  const [startTime = "00:00"] = String(time).split("-");
  const [hour = "0", minute = "0"] = startTime.split(":");
  return { hour: Number(hour), minute: Number(minute) };
};

const getUpcomingClass = (classes, now) => {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    classes.find((cls) => {
      const startTime = parseClassStartTime(cls?.time);
      return startTime.hour * 60 + startTime.minute > currentMinutes;
    }) || null
  );
};

const getTodaySchedule = (now, schedule = weeklySchedule) => {
  const dayIndex = now.getDay();
  const dayName = getDayName(dayIndex);
  const classes = schedule[dayName] || [];
  return {
    dayName,
    classes,
    upcomingClass: getUpcomingClass(classes, now),
    isAttendanceWindow:
      isWeekday(dayIndex) &&
      now.getHours() === ATTENDANCE_WINDOW_START_HOUR &&
      now.getMinutes() <= ATTENDANCE_WINDOW_END_MINUTE,
  };
};

const getScheduleTickKey = (now) =>
  `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;

const DashboardError = ({ error, onRetry }) => (
  <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
      <p className="text-slate-400 text-sm mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 py-3 rounded-xl font-bold text-white"
      >
        <RefreshCw className="w-4 h-4 mr-2 inline" />
        Retry
      </button>
    </div>
  </div>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const { recentActivity, gamificationData } = useAttendance({ role: "student", user });
  useCurriculum({ role: "student", user });
  const isMounted = useIsMounted();

  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scheduleTime, setScheduleTime] = useState(new Date());
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("heatmap");
  const [showComplaint, setShowComplaint] = useState(false);
  const [skillPath, setSkillPath] = useState("standard");
  const [showDiagnosticQuiz, setShowDiagnosticQuiz] = useState(false);
  const [achievementCount, setAchievementCount] = useState(0);

  const attendanceRef = useRef(null);
  const achievementsRef = useRef(null);
  const lastScheduleTickRef = useRef(getScheduleTickKey(new Date()));

  const attendanceStats = useMemo(() => {
    const counts = recentActivity.reduce(
      (acc, curr) => {
        const status = curr?.status?.toLowerCase();
        if (status === "present") acc.present++;
        else if (status === "absent") acc.absent++;
        else if (status === "late") acc.late++;
        return acc;
      },
      { present: 0, absent: 0, late: 0 }
    );
    const total = counts.present + counts.absent + counts.late;
    const percentage =
      total > 0 ? Math.round(((counts.present + counts.late) / total) * 100) : 0;
    return { ...counts, total, percentage };
  }, [recentActivity]);

  const scheduleState = useMemo(
    () => getTodaySchedule(scheduleTime, weeklySchedule),
    [scheduleTime]
  );

  const participationScore = useMemo(() => {
    const xp = gamificationData?.xp ?? gamificationData?.totalXp;
    if (xp) return Math.min(100, Math.round((xp % 1000) / 10) + 50);
    return attendanceStats.percentage;
  }, [gamificationData, attendanceStats.percentage]);

  const scrollToSection = useCallback((target) => {
    const ref = target === "achievements" ? achievementsRef : attendanceRef;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      if (isMounted()) setLoading(false);
    }, 1200);

    const updateDashboard = () => {
      if (!isMounted()) return;
      const now = new Date();
      setCurrentTime(now);
      const scheduleTickKey = getScheduleTickKey(now);
      if (lastScheduleTickRef.current !== scheduleTickKey) {
        lastScheduleTickRef.current = scheduleTickKey;
        setScheduleTime(now);
      }
      setError(null);
    };

    updateDashboard();
    const timer = setInterval(updateDashboard, 1000);
    return () => {
      clearInterval(timer);
      clearTimeout(loadingTimer);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const result = await apiFetch(`/api/achievements/student/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = result.data ?? result;
        setAchievementCount(payload.total ?? payload.achievements?.length ?? 0);
      } catch {
        setAchievementCount(0);
      }
    })();
  }, [user]);

  const handleEvaluateQuiz = (scoreOutOfFive) => {
    const percentage = (scoreOutOfFive / 5) * 100;
    if (percentage >= 80) setSkillPath("advanced");
    else if (percentage <= 40) setSkillPath("booster");
    else setSkillPath("standard");
    setShowDiagnosticQuiz(false);
  };

  const handleExportAttendance = (format) => {
    if (!recentActivity?.length) {
      toast.error("No attendance records to export.");
      return;
    }
    const exportData = recentActivity.map((record) => ({
      Date: record.date,
      Time: record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : "-",
      Status: record.status?.toUpperCase(),
      Confidence: record.confidenceScore
        ? `${Math.round(record.confidenceScore * 100)}%`
        : "-",
    }));
    const filename = `attendance_${user?.displayName || "student"}_${new Date().toISOString().split("T")[0]}`;
    if (format === "csv") {
      exportToCSV(exportData, filename);
      toast.success("Attendance exported to CSV");
    } else {
      exportToPDF(
        exportData,
        [
          { header: "Date", dataKey: "Date" },
          { header: "Time", dataKey: "Time" },
          { header: "Status", dataKey: "Status" },
          { header: "Confidence", dataKey: "Confidence" },
        ],
        `Attendance Report: ${user?.displayName || "Student"}`,
        filename
      );
      toast.success("Attendance exported to PDF");
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error) {
    return <DashboardError error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-[#070B14] relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto pt-20 pb-12 px-4 sm:px-6 space-y-8">
        {showDiagnosticQuiz ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-[#070B14] border border-indigo-500/30 rounded-3xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white">Dynamic Module Evaluation</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Test how the layout adapts based on your skill level.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleEvaluateQuiz(5)}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Simulate Advanced Track
              </button>
              <button
                onClick={() => handleEvaluateQuiz(2)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Simulate Booster Track
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <span className="text-sm text-slate-400">Adaptive layout:</span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                skillPath === "advanced"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : skillPath === "booster"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              }`}
            >
              {skillPath}
            </span>
          </div>
        )}

        {scheduleState.isAttendanceWindow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl"
            role="status"
          >
            <Camera className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden />
            <p className="text-sm text-emerald-300">
              Attendance window is open — mark your presence now!
            </p>
          </motion.div>
        )}

        <WelcomeSection
          user={user}
          currentTime={currentTime}
          getInitials={getUserInitials}
        />

        <AnalyticsOverviewCards
          stats={attendanceStats}
          achievementCount={achievementCount}
          activitiesCount={recentActivity.length}
        />

        <QuickActionsSection
          onScrollTo={scrollToSection}
          onOpenComplaint={() => setShowComplaint(true)}
        />

        <div className="grid xl:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-8">
            <AttendanceProgressSection
              sectionRef={attendanceRef}
              stats={attendanceStats}
              recentActivity={recentActivity}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            <AcademicProgressSection recentActivity={recentActivity} />

            <div className="space-y-4">
              <div className="flex justify-end">
                <ExportDropdown onExport={handleExportAttendance} />
              </div>
              <AttendanceInsights recentActivity={recentActivity} />
            </div>

            <AttendanceAnalytics userId={user?.uid} recentActivity={recentActivity} />
          </div>

          <aside className="space-y-6">
            <ActivityCenterWidget
              recentActivity={recentActivity}
              todayClasses={scheduleState.classes}
              upcomingClass={scheduleState.upcomingClass}
              dayName={scheduleState.dayName}
              participationScore={participationScore}
            />

            <StreakCounter currentStreak={gamificationData?.currentStreak ?? 0} />
            <XpProgressBar
              currentXp={gamificationData?.xp ?? 0}
              currentLevel={gamificationData?.level ?? 1}
            />
            <BadgeGallery unlockedBadges={gamificationData?.badges ?? []} />

            {skillPath === "advanced" && (
              <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                <h4 className="text-purple-400 font-bold text-sm mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4" aria-hidden />
                  Fast-Track Projects Unlocked
                </h4>
                <p className="text-xs text-slate-400">
                  Advanced sequence active — enjoy high-level challenges!
                </p>
              </div>
            )}

            {skillPath === "booster" && (
              <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <h4 className="text-amber-400 font-bold text-sm mb-1">Booster Modules Active</h4>
                <p className="text-xs text-slate-400">
                  Extra summaries and video references to support your learning.
                </p>
              </div>
            )}
          </aside>
        </div>

        <AchievementShowcase
          sectionRef={achievementsRef}
          attendancePercentage={attendanceStats.percentage}
          streakDays={gamificationData?.currentStreak ?? 0}
        />
      </main>

      <AnimatePresence>
        {showComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <ComplaintForm onClose={() => setShowComplaint(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
