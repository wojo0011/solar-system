import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import NarratorAstronaut from "./NarratorAstronaut";
import LanguageSwitcher from "./LanguageSwitcher";
import ReadAloudButton from "./ReadAloudButton";
import TooltipParent from "./TooltipParent";
import AnimatedMessage from "./AnimatedMessage";
import useSound from "../hooks/useSound";
import "./StartExploringScreen.css";
import startExploringDataRaw from "../data/startExploring.json";
import languages from "../data/languages.json";
import spaceExploration from "../data/spaceExploration.json";
import { getVoices, stripIcons, speakMessage, cancelSpeech } from "../utils/speechSynthesis";

export default function StartExploringScreen({ onStart, currentLanguage, setCurrentLanguage }) {
  const [isReading, setIsReading] = useState(false);
  const [voices, setVoices] = useState([]);
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const screenRef = useRef(null);
  const timerRef = useRef();

  // Language and tooltip data
  const langData = startExploringDataRaw[currentLanguage] || startExploringDataRaw.en;
  const messages = useMemo(() => langData.messages || [], [langData]);
  const tooltips = (spaceExploration[currentLanguage]?.tooltips) || spaceExploration.en.tooltips;

  // Hover sound handlers
  const { play: playHoverSound } = useSound("/hover.wav", 1);
  
  // Advance to next message
  const nextMessage = useCallback(() => {
    setMsgIndex(i => (i + 1) % messages.length);
  }, [messages.length]);

  // Cycle messages every 6s when not reading aloud
  useEffect(() => {
    if (!isReading) {
      timerRef.current = setInterval(nextMessage, 6000);
      return () => clearInterval(timerRef.current);
    } else {
      clearInterval(timerRef.current);
    }
  }, [isReading, nextMessage]);

  // Load voices on mount and when voiceschanged fires
  useEffect(() => {
    let mounted = true;
    getVoices().then(vs => { if (mounted) setVoices(vs); });
    const updateVoices = () => {
      getVoices().then(vs => { if (mounted) setVoices(vs); });
    };
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => {
      mounted = false;
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  // Speak message and advance when reading
  useEffect(() => {
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
  useEffect(() => {
    if (isReading) {
      cancelSpeech();
      setTimeout(() => setIsReading(true), 100);
    } else {
      cancelSpeech();
      setIsReading(false);
    }
    setMsgIndex(0);
  }, [currentLanguage]);

  // Cancel speech on unmount
  useEffect(() => () => { cancelSpeech(); }, []);

  // Handlers
  const handleSpeak = useCallback(() => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }
    setIsReading(true);
  }, [isReading]);

  const handleStartWithAnimation = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      onStart();
    }, 700);
  }, [onStart]);

  // Animate in on mount
  useEffect(() => {
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

  // Animate out on unmount
  useEffect(() => {
    if (!visible && screenRef.current) {
      screenRef.current.style.opacity = 0;
      screenRef.current.style.transform = 'scale(1.04)';
    }
  }, [visible]);

  return (
    <div ref={screenRef} className="start-exploring-screen">
      <TooltipParent tooltip={tooltips.languageSwitcher} className="language-switcher">
        <LanguageSwitcher currentLanguage={currentLanguage} setCurrentLanguage={setCurrentLanguage} />
      </TooltipParent>
      <NarratorAstronaut isVisible={isReading} style={{ cursor: 'pointer' }} />
      <h1 className="start-exploring-screen-title">{langData.title}</h1>
      <AnimatedMessage messages={messages} currentIndex={msgIndex} />
      <TooltipParent tooltip={tooltips.readAloud} className="centered">
        <ReadAloudButton
          isReading={isReading}
          onClick={handleSpeak}
          labelStart={langData.readAloud.start}
          labelStop={langData.readAloud.stop}
          tooltip={tooltips.readAloud}
          onMouseEnter={() => !isReading && playHoverSound()}
          onFocus={() => !isReading && playHoverSound()}
        />
      </TooltipParent>
      <TooltipParent tooltip={tooltips.exploreButton} className="centered">
        <Button
          className="start-exploring-screen-explore-btn"
          onClick={handleStartWithAnimation}
          onMouseEnter={() => !isReading && playHoverSound()}
          onFocus={() => !isReading && playHoverSound()}
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
