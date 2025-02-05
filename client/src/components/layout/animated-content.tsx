import { motion } from "framer-motion";
import { type ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

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
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export function AnimatedItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={item}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedContent({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="flex-1"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col flex-1 h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}