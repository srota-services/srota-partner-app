/**
 * Page Transition wrapper component
 */
import React from 'react';
import { motion } from 'framer-motion';
import { getPageTransition, getPageVariants } from '../../utils/motion';
import '../../styles/components/layout/PageTransition.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      variants={getPageVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={getPageTransition()}
      className="page-transition"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
