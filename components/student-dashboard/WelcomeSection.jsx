"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Clock } from "lucide-react";
import StreakTracker from "@/components/ui/StreakTracker";
import GlassCard from "./GlassCard";
import { getTimeGreeting, getDailyQuote } from "./utils";

export default function WelcomeSection({ user, currentTime, getInitials }) {
  const name = user?.displayName || user?.email?.split("@")[0] || "Student";
  const greeting = getTimeGreeting(currentTime);
  const quote = getDailyQuote(currentTime);

  return (
    <GlassCard className="p-6 sm:p-8 overflow-hidden relative" delay={0}>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4 sm:gap-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="relative shrink-0"
          >
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt={`${name} profile`}
                width={72}
                height={72}
                className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl object-cover border-2 border-indigo-400/40 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg border border-white/20">
                <span className="text-xl font-bold text-white">{getInitials(user)}</span>
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0B1120]" aria-hidden />
          </motion.div>

          <div className="min-w-0">
            <p className="text-sm text-indigo-300/90 font-medium mb-1">{greeting},</p>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
                {name}
              </h1>
              <StreakTracker />
            </div>
            <p className="text-sm text-slate-400 mt-1 truncate">{user?.email}</p>
            <div className="mt-3 flex items-start gap-2 max-w-xl">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-slate-300 italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:flex-col lg:items-end">
          <div className="text-left lg:text-right">
            <div className="flex items-center gap-2 text-white font-mono text-xl sm:text-2xl">
              <Clock className="w-4 h-4 text-indigo-400 lg:hidden" aria-hidden />
              <time dateTime={currentTime?.toISOString()}>
                {currentTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </time>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentTime?.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
