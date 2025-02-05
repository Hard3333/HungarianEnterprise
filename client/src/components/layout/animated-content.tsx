import { motion } from "framer-motion";
import { type ReactNode } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function AnimatedItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={item}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedContent({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex-1"
    >
      <motion.div className="flex flex-col flex-1">
        {children}
      </motion.div>
    </motion.div>
  );
}