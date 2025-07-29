import React from "react";
import "./ReadAloudButton.css";

export default function ReadAloudButton({ isReading, onClick, labelStart, labelStop, hoverSoundHandlers }) {
  return (
    <button
      type="button"
      className={
        'read-aloud-button start-exploring-screen-read-aloud' + (isReading ? ' reading' : '')
      }
      onClick={onClick}
      aria-pressed={isReading}
      {...hoverSoundHandlers}
    >
      <span className="read-aloud-icon" aria-hidden="true">
        {/* Speaker icon */}
        <span className={"speaker-icon" + (!isReading ? " speaker-visible" : "") }>
          <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9V15H7L12 20V4L7 9H3Z" fill="currentColor"/>
            <path className="soundwave" d="M16 8C17.6569 9.65685 17.6569 12.3431 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path className="soundwave" d="M19 5C21.7614 7.76142 21.7614 14.2386 19 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
        {/* Equalizer icon */}
        <span className={"equalizer-icon" + (isReading ? " equalizer-visible" : "") }>
          <svg width="1.5em" height="1.5em" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <rect className="eq-bar eq-bar-1" x="7" y="12" width="2.5" height="8" rx="1.2" fill="currentColor"/>
              <rect className="eq-bar eq-bar-2" x="13" y="9" width="2.5" height="14" rx="1.2" fill="currentColor"/>
              <rect className="eq-bar eq-bar-3" x="19" y="14" width="2.5" height="6" rx="1.2" fill="currentColor"/>
            </g>
          </svg>
        </span>
      </span>
      {isReading ? labelStop : labelStart}
    </button>
  );
}
