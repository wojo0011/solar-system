import React from "react";
import "./ReadAloudButton.css";

export default function ReadAloudButton({ isReading, onClick, labelStart, labelStop }) {
  return (
    
      <button
        type="button"
        className={
          'read-aloud-button start-exploring-screen-read-aloud' + (isReading ? ' reading' : '')
        }
        onClick={onClick}
        aria-pressed={isReading}
      >
        {isReading ? labelStop : labelStart}
      </button>
    
  );
}
