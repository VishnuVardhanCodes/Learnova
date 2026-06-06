"use client";

import Link from "next/link";
import {
  CalendarCheck,
  Bell,
  Activity,
  MessageSquare,
  Award,
  ChevronRight,
} from "lucide-react";
import GlassCard from "./GlassCard";

const ACTIONS = [
  {
    id: "attendance",
    label: "View Attendance",
    description: "Track your daily presence",
    icon: CalendarCheck,
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
    action: "scroll",
    target: "attendance",
  },
  {
    id: "notices",
    label: "View Notices",
    description: "Campus announcements",
    icon: Bell,
    gradient: "from-blue-500/20 to-indigo-500/10",
    iconColor: "text-blue-400",
    href: "/notices",
  },
  {
    id: "activities",
    label: "View Activities",
    description: "Explore learning tasks",
    icon: Activity,
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
    href: "/activity",
  },
  {
    id: "contact",
    label: "Contact Teacher",
    description: "Submit a request",
    icon: MessageSquare,
    gradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-400",
    action: "complaint",
  },
  {
    id: "certificates",
    label: "View Certificates",
    description: "Digital achievements",
    icon: Award,
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
    action: "scroll",
    target: "achievements",
  },
];

function ActionInner({ action }) {
  const Icon = action.icon;
  return (
    <>
      <div className={`p-2.5 rounded-xl bg-black/20 ${action.iconColor} w-fit`}>
        <Icon className="w-5 h-5" aria-hidden />
      </div>
      <div className="mt-3 min-w-0">
        <p className="font-semibold text-white text-sm">{action.label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
      </div>
      <ChevronRight
        className="absolute top-4 right-4 w-4 h-4 text-slate-500 group-hover:text-white transition"
        aria-hidden
      />
    </>
  );
}

export default function QuickActionsSection({ onScrollTo, onOpenComplaint }) {
  const handleClick = (action) => {
    if (action.action === "complaint") onOpenComplaint?.();
    if (action.action === "scroll") onScrollTo?.(action.target);
  };

  return (
    <section aria-label="Quick actions">
      <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {ACTIONS.map((action, i) => {
          const className = `group relative p-4 bg-gradient-to-br ${action.gradient}`;

          if (action.href) {
            return (
              <Link key={action.id} href={action.href} className="block">
                <GlassCard className={className} delay={i * 0.04}>
                  <ActionInner action={action} />
                </GlassCard>
              </Link>
            );
          }

          return (
            <GlassCard
              key={action.id}
              as="button"
              type="button"
              onClick={() => handleClick(action)}
              className={`${className} w-full text-left`}
              delay={i * 0.04}
            >
              <ActionInner action={action} />
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
