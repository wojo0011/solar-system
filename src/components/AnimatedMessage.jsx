import React from "react";
import "./AnimatedMessage.css";

// AnimatedMessage: cycles through messages with typing animation and blinking underscore
export default function AnimatedMessage({ messages, currentIndex }) {
  const [displayed, setDisplayed] = React.useState(0);
  const [underscoreDone, setUnderscoreDone] = React.useState(false);
  const [messageFade, setMessageFade] = React.useState(false);
  const message = messages[currentIndex] || "";

  React.useEffect(() => {
    setDisplayed(0);
    setUnderscoreDone(false);
    setMessageFade(false);
    if (!message) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(i);
      if (i >= message.length) {
        clearInterval(interval);
        setTimeout(() => setUnderscoreDone(true), 2000); // underscore fades after 2s
        setTimeout(() => setMessageFade(true), 4000); // message fades after 4s
      }
    }, 32); // typing speed
    return () => clearInterval(interval);
  }, [message, currentIndex]);

  return (
    <div
      key={currentIndex}
      className={`start-exploring-screen-animated-message${messageFade ? " fade-out" : ""}`}
      aria-live="polite"
    >
      <span>{message.slice(0, displayed)}</span>
      <span
        className={`typing-underscore${underscoreDone ? " fade-out" : ""}`}
        aria-hidden="true"
      >
        _
      </span>
    </div>
  );
}
