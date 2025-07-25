import React from "react";
import { Button } from "./ui/button";
import NarratorAstronaut from "./NarratorAstronaut";
import LanguageSwitcher from "./LanguageSwitcher";
import "./StartExploringScreen.css";
import startExploringDataRaw from "../data/startExploring.json";
import languages from "../data/languages.json";
import spaceExploration from "../data/spaceExploration.json";
import {
  getVoices,
  stripIcons,
  getPreferredVoice,
  speakMessage,
  cancelSpeech
} from "../utils/speechSynthesis";
import ReadAloudButton from "./ReadAloudButton";
import Tooltip from "./Tooltip";

// TooltipParent HOC/component for easy tooltip wrapping
function TooltipParent({ tooltip, children, className = "", ...props }) {
  return (
    <div className={`tooltip-parent${className ? " " + className : ""}`} {...props}>
      {children}
      {tooltip ? <Tooltip>{tooltip}</Tooltip> : null}
    </div>
  );
}

// AnimatedMessage: cycles through messages with fade-in animation
function AnimatedMessage({ messages, currentIndex }) {
  return (
    <div
      key={currentIndex}
      className="start-exploring-screen-animated-message"
      aria-live="polite"
    >
      {messages[currentIndex]}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function StartExploringScreen({ onStart, currentLanguage, setCurrentLanguage }) {
  const [isReading, setIsReading] = React.useState(false);
  const [voices, setVoices] = React.useState([]);
  const [msgIndex, setMsgIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  const screenRef = React.useRef(null);
  const timerRef = React.useRef();
  const utterRef = React.useRef();

  // Get language data safely
  const langData = startExploringDataRaw[currentLanguage] || startExploringDataRaw.en;
  const messages = React.useMemo(() => langData.messages || [], [langData]);
  const tooltips = (spaceExploration[currentLanguage]?.tooltips) || spaceExploration.en.tooltips;

  // Helper to advance to next message
  const nextMessage = React.useCallback(() => {
    setMsgIndex(i => (i + 1) % messages.length);
  }, [messages.length]);

  // Cycle messages every 6s (slower for kids) when not reading aloud
  React.useEffect(() => {
    if (!isReading) {
      timerRef.current = setInterval(() => {
        nextMessage();
      }, 6000);
      return () => clearInterval(timerRef.current);
    } else {
      clearInterval(timerRef.current);
    }
  }, [isReading, nextMessage]);

  // Load voices on mount and when voiceschanged fires
  React.useEffect(() => {
    let mounted = true;
    getVoices().then(vs => {
      if (mounted) setVoices(vs);
    });
    const updateVoices = () => {
      getVoices().then(vs => {
        if (mounted) setVoices(vs);
      });
    };
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => {
      mounted = false;
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  // When message changes and isReading, speak it and advance after
  React.useEffect(() => {
    let cancelled = false;
    if (!isReading) {
      cancelSpeech();
      return;
    }
    const langInfo = languages[currentLanguage] || languages.en;
    const utterLang = langInfo.voice || 'en-US';
    const fallbackLang = langInfo.fallback || 'en-US';
    const messageToSpeak = stripIcons(messages[msgIndex]);
    const fallbackVoice = voices.find(v => v.lang.startsWith('en'));
    const onEnd = () => {
      if (cancelled) return;
      setTimeout(() => {
        setMsgIndex(i => {
          const next = (i + 1) % messages.length;
          if (isReading && !cancelled) {
            setTimeout(() => {
              if (isReading && !cancelled) {
                speakMessage({
                  text: messages[next],
                  lang: utterLang,
                  voices,
                  fallbackLang,
                  fallbackVoice,
                  onEnd,
                });
              }
            }, 0);
          }
          return next;
        });
      }, 3000);
    };
    speakMessage({
      text: messageToSpeak,
      lang: utterLang,
      voices,
      fallbackLang,
      fallbackVoice,
      onEnd,
    });
    return () => {
      cancelled = true;
      cancelSpeech();
    };
  }, [isReading, msgIndex, messages, voices, currentLanguage]);

  // Reset reading state and timers when language changes
  React.useEffect(() => {
    if (isReading) {
      cancelSpeech();
      setTimeout(() => {
        setIsReading(true);
      }, 100);
    } else {
      cancelSpeech();
      setIsReading(false);
    }
    setMsgIndex(0);
  }, [currentLanguage]);

  React.useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  const handleSpeak = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }
    setIsReading(true);
    // Do NOT reset msgIndex; start reading from the current message
  };

  // Animate in on mount
  React.useEffect(() => {
    if (screenRef.current) {
      screenRef.current.style.opacity = 0;
      screenRef.current.style.transform = 'scale(0.96)';
      setTimeout(() => {
        if (screenRef.current) {
          screenRef.current.style.transition = 'opacity 0.7s, transform 0.7s';
          screenRef.current.style.opacity = 1;
          screenRef.current.style.transform = 'scale(1)';
        }
      }, 10);
    }
  }, []);

  // Animate out on unmount (when parent removes this component)
  React.useEffect(() => {
    if (!visible && screenRef.current) {
      screenRef.current.style.opacity = 0;
      screenRef.current.style.transform = 'scale(1.04)';
    }
  }, [visible]);

  // Wrap onStart to animate out before calling parent
  const handleStartWithAnimation = () => {
    setVisible(false);
    setTimeout(() => {
      onStart();
    }, 700); // match transition duration
  };

  return (
    <div
      ref={screenRef}
      className="start-exploring-screen"
    >
      <TooltipParent tooltip={tooltips.languageSwitcher} className="language-switcher">
        <LanguageSwitcher currentLanguage={currentLanguage} setCurrentLanguage={setCurrentLanguage} />
      </TooltipParent>
      <NarratorAstronaut isVisible={isReading} style={{ cursor: 'pointer' }} />
      <h1 className="start-exploring-screen-title">
        {langData.title}
      </h1>
      <AnimatedMessage messages={messages} currentIndex={msgIndex} />
      <ReadAloudButton
        isReading={isReading}
        onClick={handleSpeak}
        labelStart={langData.readAloud.start}
        labelStop={langData.readAloud.stop}
        tooltip={tooltips.readAloud}
      />
      <TooltipParent tooltip={tooltips.exploreButton} className="centered">
        <Button
          className="start-exploring-screen-explore-btn"
          onClick={handleStartWithAnimation}
        >
          <img 
            src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'><text x='0' y='32' font-size='32'>🚀</text></svg>" 
            alt="Rocket" 
            className="start-exploring-screen-rocket"
          />
          {langData.exploreButton}
        </Button>
      </TooltipParent>
      <footer className="start-exploring-screen-footer">
        &copy; {new Date().getFullYear()} corewebmedia
      </footer>
    </div>
  );
}
