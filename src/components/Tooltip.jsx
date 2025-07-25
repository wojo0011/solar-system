import React from "react";
import "./Tooltip.css";

export default function Tooltip({ children }) {
  return (
    <div className="tooltip">
      {children}
    </div>
  );
}
