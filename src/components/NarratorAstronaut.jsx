import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import "./NarratorAstronaut.css";

// Fun astronaut name for kids
const ASTRONAUT_NAME = "Astro Buddy";

export default function NarratorAstronaut({ 
    isVisible
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="narrator"
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 40 }}
          transition={{ duration: 0.35, type: 'spring', stiffness: 200 }}
          className="narrator-astronaut-container"
        >
          <img
            className="narrator-astronaut-img"
            src={require("../images/narrator.png")}
            alt="Narrator astronaut"
          />
          <div className="narrator-astronaut-label">
            {ASTRONAUT_NAME}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

NarratorAstronaut.propTypes = {
    isVisible: PropTypes.bool.isRequired,
};
