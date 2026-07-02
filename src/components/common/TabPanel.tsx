/**
 * Animated container for in-page tab content. Swaps content with a subtle
 * fade/slide keyed on the active tab id, so in-page tab switches feel
 * consistent with the app's page transitions.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTabTransition, getTabVariants } from '../../utils/motion';

interface TabPanelProps {
  /** Unique id of the currently active tab; drives the enter/exit animation. */
  activeKey: string;
  children: React.ReactNode;
  className?: string;
}

const TabPanel: React.FC<TabPanelProps> = ({
  activeKey,
  children,
  className,
}) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeKey}
        variants={getTabVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={getTabTransition()}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default TabPanel;
