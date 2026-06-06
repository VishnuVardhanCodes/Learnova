"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Award,
  Download,
  Share2,
  CheckCircle,
  ExternalLink,
  Clock,
  Grid,
  List,
  Flame,
  Sparkles,
  ShieldCheck,
  X,
  Maximize2,
  TrendingUp,
  Filter,
  RefreshCw,
  BookOpen,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { generateCertificatePDF } from "@/utils/pdf/generateCertificatePDF";

// ── Rich Mock Data ───────────────────────────────────────────────────────────
const MOCK_STATS = {
  totalAchievements: 12,
  verifiedCertificates: 6,
  totalXp: 1850,
  streakDays: 14,
  level: 4,
  growthPercentage: 25, // month-over-month growth
};

const MOCK_BADGES = [
  {
    id: "early-bird",
    title: "Early Bird",
    description: "Mark attendance before 9:05 AM.",
    icon: "🌅",
    category: "Attendance",
    level: "Gold",
    xpReward: 50,
    unlockedAt: "2026-05-10",
    progress: 100,
  },
  {
    id: "perfect-week",
    title: "Perfect Week",
    description: "Maintain a 5-day presence streak.",
    icon: "🏆",
    category: "Attendance",
    level: "Platinum",
    xpReward: 100,
    unlockedAt: "2026-05-15",
    progress: 100,
  },
  {
    id: "react-pioneer",
    title: "React Pioneer",
    description: "Successfully complete React 19 advanced module.",
    icon: "⚛️",
    category: "Technical",
    level: "Silver",
    xpReward: 75,
    unlockedAt: "2026-05-20",
    progress: 100,
  },
  {
    id: "active-learner",
    title: "Active Learner",
    description: "Reach level 5 and submit all tasks.",
    icon: "🔥",
    category: "Academic",
    level: "Bronze",
    xpReward: 30,
    unlockedAt: null,
    progress: 80,
  },
  {
    id: "ai-collaborator",
    title: "AI Collaborator",
    description: "Interact with StudyAI chatbot helper for 10 consecutive days.",
    icon: "🤖",
    category: "Technical",
    level: "Gold",
    xpReward: 60,
    unlockedAt: "2026-06-02",
    progress: 100,
  },
  {
    id: "peer-mentor",
    title: "Peer Mentor",
    description: "Resolve 5 complaints or queries in group boards.",
    icon: "🤝",
    category: "Extracurricular",
    level: "Silver",
    xpReward: 80,
    unlockedAt: null,
    progress: 40,
  },
];

const MOCK_CERTIFICATES = [
  {
    id: "cert-01",
    title: "Advanced Next.js 15 & React 19 Mastery",
    category: "Technical",
    issueDate: "2026-05-25",
    grade: "A+",
    verificationId: "LN-NXT-F4K9L2",
    status: "Verified",
    instructor: "Dr. Elizabeth Vance",
    description: "Mastery in server components, partial pre-rendering, and advanced React 19 hydration mechanisms.",
    imagePlaceholder: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cert-02",
    title: "Tailwind CSS v4 & Premium UI Design",
    category: "Technical",
    issueDate: "2026-05-12",
    grade: "A",
    verificationId: "LN-TW4-R8M3N1",
    status: "Verified",
    instructor: "Prem Shaw",
    description: "Building production-grade glassmorphic layouts, design tokens, and highly accessible user flows.",
    imagePlaceholder: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cert-03",
    title: "Smart Attendance Analytics & AI systems",
    category: "Academic",
    issueDate: "2026-05-01",
    grade: "A+",
    verificationId: "LN-AIS-K2J5H8",
    status: "Verified",
    instructor: "Prof. Alan Turing",
    description: "Understanding face recognition APIs, attendance pattern anomaly detection, and predictive modeling.",
    imagePlaceholder: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cert-04",
    title: "Leadership & Student Management Protocols",
    category: "Extracurricular",
    issueDate: "2026-04-20",
    grade: "B+",
    verificationId: "LN-LMP-Y6T9Q4",
    status: "Verified",
    instructor: "Sarah Jenkins",
    description: "Collaborative event management, modern campus grievance resolution pipelines, and peer mentoring.",
    imagePlaceholder: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop",
  },
];

const MOCK_TIMELINE = [
  {
    id: "tl-01",
    date: "2026-06-02",
    type: "Badge",
    title: "AI Collaborator Badge Unlocked",
    subtitle: "Rewarded 60 XP for 10-day chatbot engagement.",
    icon: "🤖",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "tl-02",
    date: "2026-05-25",
    type: "Certificate",
    title: "Earned Next.js 15 Mastery Certificate",
    subtitle: "Graduated with A+ under Dr. Elizabeth Vance.",
    icon: "🎓",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "tl-03",
    date: "2026-05-20",
    type: "Badge",
    title: "React Pioneer Badge Awarded",
    subtitle: "Completed React 19 core concepts successfully.",
    icon: "⚛️",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "tl-04",
    date: "2026-05-15",
    type: "Milestone",
    title: "Reached a 14-day Attendance Streak",
    subtitle: "Maintained regular active status in all classes.",
    icon: "⚡",
    color: "from-cyan-400 to-teal-500",
  },
  {
    id: "tl-05",
    date: "2026-05-12",
    type: "Certificate",
    title: "Earned Tailwind CSS v4 Certification",
    subtitle: "Design principles and utility layers completed.",
    icon: "🎨",
    color: "from-sky-400 to-blue-500",
  },
];

export default function AchievementsShowcase() {
  // ── States ────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All"); // All, Certificate, Badge
  const [sortBy, setSortBy] = useState("Newest"); // Newest, Oldest, Alphabetical
  const [layoutMode, setLayoutMode] = useState("grid"); // grid, list
  const [activeTab, setActiveTab] = useState("gallery"); // gallery, badges, timeline
  const [selectedCert, setSelectedCert] = useState(null); // certificate for preview modal
  const [isFullscreenCert, setIsFullscreenCert] = useState(false);

  // Categories list derived from both certificates and badges
  const categories = ["All", "Technical", "Academic", "Attendance", "Extracurricular"];

  // ── Filtered Data Calculations ──────────────────────────────────────────
  const filteredCertificates = useMemo(() => {
    return MOCK_CERTIFICATES.filter((cert) => {
      const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.verificationId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || cert.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === "Newest") return new Date(b.issueDate) - new Date(a.issueDate);
      if (sortBy === "Oldest") return new Date(a.issueDate) - new Date(b.issueDate);
      if (sortBy === "Alphabetical") return a.title.localeCompare(b.title);
      return 0;
    });
  }, [searchTerm, selectedCategory, sortBy]);

  const filteredBadges = useMemo(() => {
    return MOCK_BADGES.filter((badge) => {
      const matchesSearch = badge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || badge.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === "Alphabetical") return a.title.localeCompare(b.title);
      // Unlocked first
      if (a.unlockedAt && !b.unlockedAt) return -1;
      if (!a.unlockedAt && b.unlockedAt) return 1;
      return 0;
    });
  }, [searchTerm, selectedCategory, sortBy]);

  // ── Action Handlers ────────────────────────────────────────────────────────
  const handleDownloadPDF = (cert) => {
    try {
      generateCertificatePDF({
        studentName: "John Doe", // Fallback placeholder student
        courseTitle: cert.title,
        completionDate: cert.issueDate,
        instructorName: cert.instructor,
      });
      toast.success(`${cert.title} PDF downloaded successfully!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const handleShareCertificate = (cert) => {
    const mockUrl = `${window.location.origin}/verify/certificate/${cert.verificationId}`;
    navigator.clipboard.writeText(mockUrl);
    toast.success("Verification link copied to clipboard!");
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedType("All");
    setSortBy("Newest");
    toast.success("Filters reset successfully");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white select-none">
      
      {/* ── Title & Intro Header ── */}
      <div className="mb-10 text-center sm:text-left">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-full">
            🏆 Accomplishments Hub
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
            Achievements & Certificates
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Showcase your hard-earned credentials, academic credentials, and community badges. Access instant verification and secure offline PDF sharing downloads.
          </p>
        </motion.div>
      </div>

      {/* ── Statistics Grid Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {/* Stat Card: Total Achievements */}
        <div className="relative group overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full filter blur-xl group-hover:bg-cyan-500/20 transition-all duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Achievements Unlocked</p>
              <h3 className="text-3xl font-extrabold mt-1 text-white">{MOCK_STATS.totalAchievements}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-green-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{MOCK_STATS.growthPercentage}% this term</span>
          </div>
        </div>

        {/* Stat Card: Verified Certificates */}
        <div className="relative group overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full filter blur-xl group-hover:bg-blue-500/20 transition-all duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 rounded-xl text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Verified Certificates</p>
              <h3 className="text-3xl font-extrabold mt-1 text-white">{MOCK_STATS.verifiedCertificates}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-blue-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Cryptographically Secured</span>
          </div>
        </div>

        {/* Stat Card: Current Streak */}
        <div className="relative group overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full filter blur-xl group-hover:bg-amber-500/20 transition-all duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-500/10 rounded-xl text-amber-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Attendance Streak</p>
              <h3 className="text-3xl font-extrabold mt-1 text-white">{MOCK_STATS.streakDays} Days</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Level {MOCK_STATS.level} Scholar</span>
          </div>
        </div>

        {/* Stat Card: Total XP Points */}
        <div className="relative group overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full filter blur-xl group-hover:bg-purple-500/20 transition-all duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-purple-500/10 rounded-xl text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Earned XP Rewards</p>
              <h3 className="text-3xl font-extrabold mt-1 text-white">{MOCK_STATS.totalXp} XP</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-purple-300">
            <div className="w-full bg-purple-950/80 rounded-full h-1.5 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: "70%" }} />
            </div>
            <span>70%</span>
          </div>
        </div>
      </motion.div>

      {/* ── Navigation Tab Switcher ── */}
      <div className="flex justify-center sm:justify-start border-b border-white/10 gap-1 mb-8">
        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "gallery"
              ? "border-cyan-400 text-cyan-400 bg-cyan-950/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Award className="w-4 h-4" />
          Certificate Gallery ({filteredCertificates.length})
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "badges"
              ? "border-cyan-400 text-cyan-400 bg-cyan-950/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Gamified Badges ({filteredBadges.length})
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "timeline"
              ? "border-cyan-400 text-cyan-400 bg-cyan-950/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          Interactive Timeline
        </button>
      </div>

      {/* ── Search & Filter Controls Panel ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md shadow-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, instructor, hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 text-white transition-all placeholder-slate-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-cyan-400/60 text-white cursor-pointer transition-all"
            >
              <option value="All">All Categories</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-cyan-400/60 text-white cursor-pointer transition-all"
            >
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
              <option value="Alphabetical">Alphabetical A-Z</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={handleResetFilters}
              className="flex-1 flex items-center justify-center gap-1.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-semibold py-2.5 rounded-xl text-slate-300"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
            <div className="hidden sm:flex gap-1 border border-white/10 rounded-xl p-1 bg-black/20">
              <button
                onClick={() => setLayoutMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === "grid" ? "bg-white/10 text-cyan-400" : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === "list" ? "bg-white/10 text-cyan-400" : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Active Tab Display ── */}
      <AnimatePresence mode="wait">
        {/* Tab 1: Certificate Gallery */}
        {activeTab === "gallery" && (
          <motion.div
            key="gallery-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {filteredCertificates.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <Award className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No Certificates Found</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                  Try adjusting your search terms or filtering settings to locate the certificate.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black text-xs font-semibold rounded-lg transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : layoutMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCertificates.map((cert) => (
                  <motion.div
                    key={cert.id}
                    layout
                    whileHover={{ y: -6 }}
                    className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-white/10 via-white/5 to-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-cyan-400/30 group"
                  >
                    {/* Glowing effect inside card */}
                    <div className="absolute -inset-px bg-gradient-to-r from-transparent via-cyan-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative">
                      {/* Top bar with category & status */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/30 border border-cyan-800/30 px-3 py-1 rounded-full">
                          {cert.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 fill-green-500/10" />
                          <span>{cert.status}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        Instructor: <span className="text-slate-300">{cert.instructor}</span>
                      </p>
                      <p className="text-slate-400 text-xs mt-3 line-clamp-2 leading-relaxed">
                        {cert.description}
                      </p>
                    </div>

                    <div className="relative mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Verification ID</p>
                        <p className="text-xs font-mono text-cyan-300/80 font-bold">{cert.verificationId}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all"
                          title="Preview Full Certificate"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareCertificate(cert)}
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all"
                          title="Copy Share Link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(cert)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-400 to-teal-500 hover:from-cyan-300 hover:to-teal-400 text-black text-xs font-bold rounded-lg transition-all active:scale-95 shadow-md shadow-cyan-500/10"
                        >
                          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // List layout
              <div className="flex flex-col gap-4">
                {filteredCertificates.map((cert) => (
                  <motion.div
                    key={cert.id}
                    layout
                    className="relative flex flex-col md:flex-row md:items-center md:justify-between bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md hover:border-cyan-400/20 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 flex-shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                          {cert.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="text-cyan-400 font-semibold">{cert.category}</span>
                          <span>•</span>
                          <span>Issued: {cert.issueDate}</span>
                          <span>•</span>
                          <span>Grade: {cert.grade}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                      <span className="text-xs font-mono text-slate-500 hidden lg:inline mr-2">{cert.verificationId}</span>
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-slate-300 transition-all"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(cert)}
                        className="p-2 bg-gradient-to-r from-cyan-400 to-teal-500 hover:from-cyan-300 hover:to-teal-400 text-black rounded-lg transition-all"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 2: Gamified Badges */}
        {activeTab === "badges" && (
          <motion.div
            key="badges-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {filteredBadges.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No Badges Found</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                  Try adjusting filters or search strings to find locked/unlocked badges.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBadges.map((badge) => {
                  const isUnlocked = badge.unlockedAt !== null;
                  
                  return (
                    <motion.div
                      key={badge.id}
                      whileHover={{ scale: 1.02 }}
                      className={`relative flex flex-col justify-between p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                        isUnlocked
                          ? "bg-gradient-to-b from-white/10 via-white/5 to-cyan-950/20 border-white/15 hover:border-cyan-400/40"
                          : "bg-black/40 border-white/5 opacity-60 grayscale"
                      }`}
                    >
                      <div>
                        {/* Badge Header: Level/Rarity */}
                        <div className="flex justify-between items-center mb-4">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            badge.level === "Gold" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            badge.level === "Platinum" ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20" :
                            badge.level === "Silver" ? "bg-slate-300/10 text-slate-300 border border-slate-300/20" :
                            "bg-orange-600/10 text-orange-400 border border-orange-600/20"
                          }`}>
                            {badge.level} Tier
                          </span>
                          <span className="text-xs font-bold text-cyan-400">
                            +{badge.xpReward} XP
                          </span>
                        </div>

                        {/* Large Icon Box */}
                        <div className="flex gap-4 items-center mb-4">
                          <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-4xl shadow-inner shadow-white/5">
                            {badge.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white leading-tight">
                              {badge.title}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">{badge.category}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                          {badge.description}
                        </p>
                      </div>

                      {/* Progress bar or unlock state */}
                      <div className="mt-6 pt-4 border-t border-white/5">
                        {isUnlocked ? (
                          <div className="flex items-center justify-between text-xs text-cyan-400 font-bold">
                            <span>Unlocked!</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {badge.unlockedAt}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5 font-semibold">
                              <span>Challenge Progress</span>
                              <span>{badge.progress}%</span>
                            </div>
                            <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${badge.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 3: Interactive Timeline */}
        {activeTab === "timeline" && (
          <motion.div
            key="timeline-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto py-6"
          >
            <div className="relative border-l border-white/10 pl-6 sm:pl-8 ml-4">
              {MOCK_TIMELINE.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative mb-10 group"
                >
                  {/* Timeline indicator node */}
                  <span className="absolute -left-[38px] sm:-left-[46px] top-1.5 w-7 h-7 bg-slate-900 border-2 border-cyan-400/80 rounded-full flex items-center justify-center text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>

                  {/* Card wrapper */}
                  <div className="bg-white/5 border border-white/10 hover:border-cyan-400/20 rounded-xl p-5 backdrop-blur-md transition-all shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/30 px-2.5 py-1 border border-cyan-800/20 rounded-full w-fit">
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Certificate Preview Modal ── */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
          >
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`relative bg-gradient-to-br from-slate-950 via-slate-900 to-black border border-white/15 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl transition-all ${
                isFullscreenCert ? "max-w-full h-[95vh] flex flex-col justify-between" : ""
              }`}
            >
              {/* Top controls */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-cyan-400" />
                    Secure Certificate Preview
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Cryptographically signed and verified by Learnova Academy</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFullscreenCert(!isFullscreenCert)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5"
                    title={isFullscreenCert ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCert(null);
                      setIsFullscreenCert(false);
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-all border border-red-500/10"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Certificate Canvas Mock */}
              <div className="flex-1 overflow-auto bg-white text-black rounded-2xl p-6 sm:p-8 border-4 border-amber-500/50 shadow-inner flex flex-col justify-between text-center relative font-serif min-h-[300px]">
                {/* Vintage gold border inside */}
                <div className="absolute inset-2 border border-slate-300 pointer-events-none" />
                <div className="absolute inset-3 border border-indigo-900/10 pointer-events-none" />

                <div>
                  <h4 className="text-xs tracking-[0.2em] font-sans font-bold text-indigo-600 uppercase">
                    Learnova Academy
                  </h4>
                  <div className="w-16 h-0.5 bg-slate-300 mx-auto mt-2 mb-4" />
                  <p className="text-[11px] sm:text-xs text-slate-500 italic mt-4">This completion certificate is proudly presented to</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-serif">John Doe</h3>
                  <div className="w-24 h-[1px] bg-amber-500 mx-auto mt-2" />
                </div>

                <div className="my-6">
                  <p className="text-[11px] sm:text-xs text-slate-500 italic">for successfully completing curriculum requirements of</p>
                  <h2 className="text-lg sm:text-xl font-bold text-indigo-900 mt-2 font-sans">
                    {selectedCert.title}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-600 mt-4">
                    Grade achieved: <span className="font-bold text-slate-800">{selectedCert.grade}</span> on {selectedCert.issueDate}
                  </p>
                </div>

                <div className="flex justify-between items-end mt-4">
                  {/* Left: Instructor Sign */}
                  <div className="text-left font-sans text-[9px] sm:text-[10px] text-slate-500">
                    <p className="font-bold text-slate-800 italic font-serif border-b border-slate-300 pb-1 mb-1">
                      {selectedCert.instructor}
                    </p>
                    <p className="uppercase tracking-wider">INSTRUCTOR</p>
                  </div>

                  {/* Center: Gold Stamp Seal */}
                  <div className="w-12 h-12 bg-amber-400 rounded-full border border-amber-600 flex items-center justify-center text-[7px] font-bold text-amber-950 shadow-md">
                    ★ SEAL ★
                  </div>

                  {/* Right: Director Sign */}
                  <div className="text-right font-sans text-[9px] sm:text-[10px] text-slate-500">
                    <p className="font-bold text-slate-800 italic font-serif border-b border-slate-300 pb-1 mb-1">
                      Prem Shaw
                    </p>
                    <p className="uppercase tracking-wider">DIRECTOR</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] uppercase text-slate-500 tracking-wider">Verification ID</p>
                  <p className="text-xs font-mono text-cyan-300 font-bold">{selectedCert.verificationId}</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleShareCertificate(selectedCert)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 border border-white/10 hover:border-cyan-500/20 hover:bg-cyan-500/5 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy Verification URL
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(selectedCert)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-teal-500 hover:from-cyan-300 hover:to-teal-400 text-black rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-cyan-500/15"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    Download PDF Document
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
