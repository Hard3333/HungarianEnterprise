import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ReactNode } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export function AnimatedContent({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex-1"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="h-full"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Export a pre-configured motion.div component for animated items
export const AnimatedItem = motion(motion.div);