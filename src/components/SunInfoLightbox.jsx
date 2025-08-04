import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import "./SunInfoLightbox.css";
import PropTypes from "prop-types";

export default function SunInfoLightbox({
  open,
  sunModalText,
  onClose
}) {
  

  // Trap focus within lightbox when open, only close button is tabbable
  useEffect(() => {
    if (!open) return;
    const modal = document.querySelector('.sun-modal-lightbox');
    if (!modal) return;
    const closeBtn = modal.querySelector('.close-btn.sun-modal-lightbox-close-btn');
    if (!closeBtn) return;
    // Focus the close button when opened
    closeBtn.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        closeBtn.focus();
      }
    };
    modal.addEventListener('keydown', handleKeyDown);
    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <motion.dialog
      open={open}
      className="sun-modal-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sun-lightbox-title"
      aria-describedby="sun-lightbox-desc"
      aria-label={sunModalText.lightboxAriaLabel}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
        tabIndex={-1} // Ensure it can trap focus
    >
      <div className="sun-modal-lightbox-inner">
        <Button
          onClick={e => { e.stopPropagation(); onClose(); }}
          className="close-btn sun-modal-lightbox-close-btn"
          aria-label={sunModalText.closeLargeSurfaceView}
          tabIndex={0}  // Ensure it can be focused
        >
          <span className="close-x">×</span>
        </Button>
        
        <button
          type="button"
          className="sun-modal-lightbox-img-btn"
          aria-label={sunModalText.closeLargeSurfaceView}
          onClick={e => { e.stopPropagation(); onClose(); }}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }
          }}    
          tabIndex={-1}
        >
          <img
            src={sunModalText.img}
            alt={sunModalText.imgAria || `${sunModalText.name} surface large`}
            className="sun-modal-lightbox-img"
            draggable={false}
            id="sun-lightbox-desc"
          />
        </button>
        <span className="sun-modal-lightbox-title" id="sun-lightbox-title">{sunModalText.name}</span>
      </div>
    </motion.dialog>
  );
}



SunInfoLightbox.propTypes = {
  open: PropTypes.bool.isRequired,
  sunModalText: PropTypes.shape({
    name: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    closeLargeSurfaceView: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};
