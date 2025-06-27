import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Fun astronaut name for kids
const ASTRONAUT_NAME = "Astro Buddy";

export default function NarratorAstronaut({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="narrator"
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 40 }}
          transition={{ duration: 0.35, type: 'spring', stiffness: 200 }}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <img
            src={require("../images/narrator.png")}
            alt="Narrator astronaut"
            style={{
              width: 188,
              height: 188,
              transform: 'scaleX(-1)',
              pointerEvents: 'none',
              userSelect: 'none',
              display: 'block',
            }}
          />
          <div
            style={{
              marginTop: 4,
              background: 'rgba(0,0,0,0.7)',
              color: '#ffe680',
              fontWeight: 700,
              fontSize: '1.2rem',
              borderRadius: '1rem',
              padding: '0.25rem 1.1rem',
              boxShadow: '0 2px 8px #000a',
              textAlign: 'center',
              letterSpacing: '0.03em',
              userSelect: 'none',
            }}
          >
            {ASTRONAUT_NAME}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
