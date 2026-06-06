"use client";

import { motion } from "framer-motion";

const MOTION_MAP = {
  div: motion.div,
  button: motion.button,
  a: motion.a,
  section: motion.section,
};

export default function GlassCard({
  children,
  className = "",
  delay = 0,
  hover = true,
  as = "div",
  ...props
}) {
  const Component = MOTION_MAP[as] || motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -3, scale: 1.005 } : undefined}
      className={`bg-[#0B1120]/75 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
