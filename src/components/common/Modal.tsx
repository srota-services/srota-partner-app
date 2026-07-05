/**
 * Reusable Modal component
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getModalVariants,
  getOverlayVariants,
  getPageTransition,
  getTabTransition,
} from '../../utils/motion';
import CloseButton from './CloseButton';
import '../../styles/components/common/Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          variants={getOverlayVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={getTabTransition()}
        >
          <motion.div
            className={`modal-content modal-${size}`}
            onClick={e => e.stopPropagation()}
            variants={getModalVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={getPageTransition()}
          >
            {title && (
              <div className="modal-header">
                <h2 className="modal-title">{title}</h2>
                <CloseButton onClick={onClose} />
              </div>
            )}
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
