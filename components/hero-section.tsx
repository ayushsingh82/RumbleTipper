"use client"

import { useState } from "react"
import { WorkflowDiagram } from "@/components/workflow-diagram"
import { ArrowRight, Wallet2, Users } from "lucide-react"
import { motion } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  const [mode, setMode] = useState<"supporter" | "creator">("supporter")

  return (
    <section className="relative w-full px-12 pt-6 pb-12 lg:px-24 lg:pt-10 lg:pb-16">
      <div className="flex flex-col items-center text-center">
        {/* Top headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease }}
          className="font-pixel text-4xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-2 select-none"
        >
          FIND. TIP. SUPPORT.
        </motion.h1>

        {/* Central Workflow Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="w-full max-w-2xl my-4 lg:my-6"
        >
          <WorkflowDiagram />
        </motion.div>

        {/* Bottom headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.25, ease }}
          className="font-pixel text-4xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-4 select-none"
          aria-hidden="true"
        >
          RUMBLETIPPER.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease }}
          className="text-xs lg:text-sm text-muted-foreground max-w-md mb-6 leading-relaxed font-mono"
        >
          AI agent that finds high-potential Rumble creators early and tips them. Deposit USD₮, let the agent analyze engagement and send tips via Rumble’s native wallet — no extra friction.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group flex items-center gap-0 bg-foreground text-background text-sm font-mono tracking-wider uppercase"
        >
          <span className="flex items-center justify-center w-10 h-10 bg-[#ea580c]">
            <motion.span
              className="inline-flex"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <ArrowRight size={16} strokeWidth={2} className="text-background" />
            </motion.span>
          </span>
          <span className="px-5 py-2.5">
            Download extension
          </span>
        </motion.button>

        {/* Earnings modes: supporter vs creator */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75, ease }}
          className="mt-5 flex flex-col items-center gap-3"
        >
          <div className="inline-flex rounded-full border border-foreground/20 bg-background/70 backdrop-blur px-1 py-1 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setMode("supporter")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
                mode === "supporter"
                  ? "bg-[#ea580c] text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet2 size={13} />
              <span>Supporter earnings</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("creator")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
                mode === "creator"
                  ? "bg-[#ea580c] text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users size={13} />
              <span>Creator earnings</span>
            </button>
          </div>

          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="rounded-xl border border-foreground/15 bg-background/80 px-4 py-3 text-[11px] font-mono text-left max-w-md"
          >
            {mode === "supporter" ? (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-muted-foreground">You as supporter (demo)</span>
                  <span className="text-xs font-semibold text-foreground">$125.40 USD₮ tipped</span>
                </div>
                <p className="text-muted-foreground">
                  RumbleTipper tracks how much your agent has sent across all creators this week and keeps
                  you within your budget.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-muted-foreground">You as creator (demo)</span>
                  <span className="text-xs font-semibold text-foreground">$342.75 USD₮ received</span>
                </div>
                <p className="text-muted-foreground">
                  See how much has arrived from agent-driven tips, which videos attracted the most
                  support, and when spikes happened.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
