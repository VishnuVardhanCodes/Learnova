export const RISK_STYLES = {
  Excellent: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    bar: "from-emerald-500 to-teal-400",
    glow: "shadow-emerald-500/20",
  },
  Good: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    bar: "from-blue-500 to-cyan-400",
    glow: "shadow-blue-500/20",
  },
  Average: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    bar: "from-amber-500 to-orange-400",
    glow: "shadow-amber-500/20",
  },
  "At Risk": {
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    bar: "from-rose-500 to-red-500",
    glow: "shadow-rose-500/20",
  },
};

export function getRiskStyle(riskLevel) {
  return RISK_STYLES[riskLevel] || RISK_STYLES.Average;
}

export function getTrendLabel(trend) {
  if (trend === "improving") return "Improving";
  if (trend === "declining") return "Declining";
  return "Stable";
}
