import React from "react";
import Tooltip from "./Tooltip";

// TooltipParent HOC/component for easy tooltip wrapping
export default function TooltipParent({ tooltip, children, className = "", ...props }) {
  return (
    <div className={`tooltip-parent${className ? " " + className : ""}`} {...props}>
      {children}
      {tooltip ? <Tooltip>{tooltip}</Tooltip> : null}
    </div>
  );
}
