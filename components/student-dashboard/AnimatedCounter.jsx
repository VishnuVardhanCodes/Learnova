"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function AnimatedCounter({ value = 0, suffix = "", decimals = 0 }) {
  const spring = useSpring(0, { stiffness: 80, damping: 18 });
  const display = useTransform(spring, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()
  );
  const [text, setText] = useState("0");

  useEffect(() => {
    spring.set(Number(value) || 0);
  }, [value, spring]);

  useEffect(() => {
    return display.on("change", (v) => setText(v));
  }, [display]);

  return (
    <motion.span aria-live="polite">
      {text}
      {suffix}
    </motion.span>
  );
}
