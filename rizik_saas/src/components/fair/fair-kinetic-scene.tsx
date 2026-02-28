"use client";

import { motion, useReducedMotion } from "framer-motion";

interface FairKineticSceneProps {
  topDepartment: string;
  totalDepartments: number;
  totalTasks: number;
  scanCode?: string;
}

interface OrbitNode {
  size: number;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  delay: number;
  duration: number;
}

const orbitConfig: OrbitNode[] = [
  { size: 92, top: "14%", left: "8%", delay: 0.1, duration: 7.5 },
  { size: 72, top: "22%", right: "14%", delay: 0.4, duration: 6.5 },
  { size: 64, bottom: "22%", left: "16%", delay: 0.9, duration: 8.2 },
  { size: 84, bottom: "12%", right: "10%", delay: 1.2, duration: 7.1 },
];

export default function FairKineticScene({
  topDepartment,
  totalDepartments,
  totalTasks,
  scanCode,
}: FairKineticSceneProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative h-[360px] sm:h-[420px] w-full overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(160deg,#061a3f_0%,#0b357c_45%,#00a767_130%)] p-5 shadow-[0_30px_80px_rgba(2,10,27,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.32),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(89,222,164,0.36),transparent_30%),radial-gradient(circle_at_90%_85%,rgba(255,255,255,0.17),transparent_35%)]" />

      <motion.div
        className="absolute -top-10 -right-10 h-44 w-44 rounded-full border border-white/30"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={reduceMotion ? undefined : { repeat: Infinity, duration: 18, ease: "linear" }}
      />

      <motion.div
        className="absolute -bottom-16 -left-14 h-56 w-56 rounded-full border border-white/15"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={reduceMotion ? undefined : { repeat: Infinity, duration: 24, ease: "linear" }}
      />

      {orbitConfig.map((orb, index) => (
        <motion.div
          key={`${orb.size}-${index}`}
          className="absolute rounded-full border border-white/35 bg-white/10 backdrop-blur-md"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            right: orb.right,
            bottom: orb.bottom,
            left: orb.left,
          }}
          animate={reduceMotion ? undefined : { y: [0, -10, 0], x: [0, 5, 0] }}
          transition={reduceMotion ? undefined : { repeat: Infinity, duration: orb.duration, delay: orb.delay, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <p className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
            Fair Visual Engine
          </p>
          <p className="text-[11px] font-semibold text-white/80">{scanCode ? `Scan ${scanCode.slice(0, 12)}` : "Experience Mode"}</p>
        </div>

        <motion.div
          className="rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-md"
          initial={reduceMotion ? false : { opacity: 0, y: 15 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.5 }}
        >
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/75">Top Department Pulse</p>
          <h2 className="mt-2 text-2xl font-extrabold text-white leading-tight">{topDepartment}</h2>
          <p className="mt-1 text-xs text-white/75">Live momentum source for the current scoreboard leader.</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="rounded-xl border border-white/25 bg-white/10 px-3 py-3 backdrop-blur-md"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { delay: 0.15, duration: 0.45 }}
          >
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/70">Departments</p>
            <p className="mt-1 text-2xl font-bold text-white">{totalDepartments}</p>
          </motion.div>

          <motion.div
            className="rounded-xl border border-white/25 bg-white/10 px-3 py-3 backdrop-blur-md"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { delay: 0.25, duration: 0.45 }}
          >
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/70">Missions</p>
            <p className="mt-1 text-2xl font-bold text-white">{totalTasks}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
