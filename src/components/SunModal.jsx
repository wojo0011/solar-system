import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import NarratorAstronaut from "./NarratorAstronaut";
import "./SunModal.css";
import sunModalText from "../data/sunModal.json";
import SunInfoLightbox from "./SunInfoLightbox";

export default function SunModal({ setSelectedPlanet, setSelectedPlanetIdx }) {
  const [isReading, setIsReading] = useState(false);
  const [voices, setVoices] = useState([]);
  const [showSunInfoLightbox, setShowSunInfoLightbox] = useState(false);

  // Mercury and Pluto for navigation
  const mercury = { name: "Mercury", img: "images/mercury.png" };
  const pluto = { name: "Pluto", img: "images/pluto.png" };

  // Load voices on mount and when voiceschanged fires
  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  // Stop speech when modal is closed
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const handleStart = () => setIsReading(true);
    window.speechSynthesis.addEventListener('start', handleStart);
    return () => {
      window.speechSynthesis.removeEventListener('start', handleStart);
    };
  }, []);

  const getAstroVoice = () => {
    // Try to pick a more natural, child-friendly voice
    // Use voices from state
    if (!voices.length) return null;
    const preferred = voices.find(v =>
      /Google (US|UK) English|Microsoft (Aria|Jenny|Guy|Zira|David)/i.test(v.name)
    );
    return (
      preferred ||
      voices.find(v => v.lang.startsWith('en') && v.gender === 'female') ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0]
    );
  };

  const handleSpeak = (text) => {
    if (isReading) {
      // If already reading, stop reading
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsReading(false);
      return;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsReading(true);
    setTimeout(() => {
      const utterance = new window.SpeechSynthesisUtterance(text);
      const voice = getAstroVoice();
      if (voice) utterance.voice = voice;
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
    }, 750);
  };

  // Trap focus within modal when open
  useEffect(() => {
    const modal = document.querySelector('.sun-modal-dialog');
    if (!modal) return;
    const focusableSelectors = [
      'button', '[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'
    ];
    const getFocusable = () => Array.from(modal.querySelectorAll(focusableSelectors.join(',')))
      .filter(el => !el.disabled && el.offsetParent !== null);
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusableEls = getFocusable();
      if (!focusableEls.length) return;
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    modal.addEventListener('keydown', handleKeyDown);
    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
      <div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="sun-modal-dialog"
        onClick={e => {
          // If reading, stop reading but do not close modal
          if (isReading) {
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
            setIsReading(false);
            e.stopPropagation();
            return;
          }
          setSelectedPlanet(null);
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            if (!isReading && showSunInfoLightbox) {
              setShowSunInfoLightbox(false);
            }
            return;
          }
        }}
      >
        <NarratorAstronaut isVisible={isReading} />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="sun-modal-content"
          onClick={e => e.stopPropagation()}
        >
          <Button
            onClick={() => {setSelectedPlanet(null) }}
            className="close-btn sun-modal-tab-outline  "
            aria-label="Close"
            tabIndex={0}
            autoFocus
          > 
            <span className="close-x">×</span>
          </Button>
          {/* Left: Name, Sun image, Description */}
          <div className="sun-modal-left">
            <h2 className="sun-modal-title">
              {sunModalText.title}
            </h2>
            {/* Show sun image directly on large screens, and nav row only on mobile */}
            <button
              type="button"
              className="sun-modal-image-btn sun-modal-desktop-image sun-modal-tab-outline"
              onClick={() => setShowSunInfoLightbox(true)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowSunInfoLightbox(true);
                }
              }}
              aria-label={`${sunModalText.showLargeView} ${sunModalText.name}`}
              style={{ background: "none", border: "none", padding: 0, margin: 0, display: "block" }}
            >
              <img
                src={sunModalText.img}
                alt={sunModalText.name}
                className="sun-modal-image"
                draggable={false}
              />
            </button>
            <div className="sun-modal-image-nav-row">
              <Button
                className="font-bold rounded-full shadow-lg flex items-center justify-center group sun-modal-planet-btn sun-modal-inline-planet-btn sun-modal-tab-outline"
                aria-label={sunModalText.goToPluto}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedPlanet(pluto);
                  setSelectedPlanetIdx(1); // Pluto is now static, index 1
                }}
                tabIndex={0}
              >
                <img
                  src="images/pluto.png"
                  alt={sunModalText.goToPluto}
                  className="sun-modal-planet-img"
                />
                <span className="zoom-ring" />
              </Button>
              <button
                type="button"
                className="sun-modal-image-btn sun-modal-mobile-image sun-modal-tab-outline"
                onClick={() => setShowSunInfoLightbox(true)}
                onKeyDown={e => { 
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowSunInfoLightbox(true);
                  }
                }}
                aria-label={`${sunModalText.showLargeView} ${sunModalText.name}`}
                style={{ background: "none", border: "none", padding: 0, margin: 0, display: "block" }}
              >
                <img
                  src={sunModalText.img}
                  alt={sunModalText.name}
                  className="sun-modal-image sun-modal-mobile-image"
                  draggable={false}
                />
              </button>
              <Button
                className="font-bold rounded-full shadow-lg flex items-center justify-center group sun-modal-planet-btn sun-modal-inline-planet-btn sun-modal-tab-outline"
                aria-label={sunModalText.goToMercury}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedPlanet(mercury);
                  setSelectedPlanetIdx(0); // Mercury is now static, index 0
                }}
                tabIndex={0}
              >
                <img
                  src="images/mercury.png"
                  alt={sunModalText.goToMercury}
                  className="sun-modal-planet-img"
                />
                <span className="zoom-ring" />
              </Button>
            </div>
            
            <div className="sun-modal-info-actions sun-modal-info-actions-mobile sun-modal-tab-outline">
              <Button
                className={'read-aloud-button' + (isReading ? ' reading' : '') + ' sun-modal-tab-outline'}
                onClick={() => handleSpeak(sunModalText.readAloudTexts.map(item => item.text).join(' '))}
              >
                {isReading ? sunModalText.stopReading : sunModalText.readAloud}
              </Button>
            </div>
            <p className="sun-modal-description">
              {sunModalText.description}
            </p>
          </div>
          {/* Right: Info */}
          <div className="sun-modal-right">
            {sunModalText.facts?.map((fact) => (
              <div className="sun-modal-fact" key={fact.label || fact.text} style={{marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <div className="sun-modal-fact-main">
                {fact.img && (
                  <img src={fact.img} alt={fact.alt || ''} className="sun-modal-fact-img" style={{display:'block',marginTop:'0.5em',maxWidth:'35px'}} />
                )}
                <label className="sun-modal-label">{fact.label}</label> <span style={{color: fact.color}}>{fact.text}</span>
                </div>
                <span className="sun-modal-info-comparison">{fact.readable}</span>
              </div>
            ))}
            
            <div className="sun-modal-info-actions sun-modal-info-actions-desktop sun-modal-tab-outline">
              <Button
                className={'read-aloud-button' + (isReading ? ' reading' : '') + ' sun-modal-tab-outline'}
                onClick={() => handleSpeak(sunModalText.readAloudTexts.map(item => item.text).join(' '))}
              >
                {isReading ? sunModalText.stopReading : sunModalText.readAloud}
              </Button>
            </div>
          </div>
          {/* Planet button on the right: open Mercury modal */}
          <div className="sun-modal-mercury-btn">
            <Button
              className="font-bold rounded-full shadow-lg flex items-center justify-center group sun-modal-planet-btn sun-modal-tab-outline"
              aria-label={sunModalText.goToMercury}
              onClick={e => {
                e.stopPropagation();
                setSelectedPlanet(mercury);
                setSelectedPlanetIdx(0); // Mercury is now static, index 0
              }}
              tabIndex={0}
            >
              <img
                src="images/mercury.png"
                alt={sunModalText.goToMercury}
                className="sun-modal-planet-img"
              />
              <span
                className="zoom-ring"
              />
            </Button>
          </div>
          {/* Previous button on the left: open Pluto modal */}
          <div className="sun-modal-pluto-btn">
            <Button
              className="font-bold rounded-full shadow-lg flex items-center justify-center group sun-modal-planet-btn sun-modal-tab-outline"
              aria-label={sunModalText.goToPluto}
              onClick={e => {
                e.stopPropagation();
                setSelectedPlanet(pluto);
                setSelectedPlanetIdx(1); // Pluto is now static, index 1
              }}
              tabIndex={0}
            >
              <img
                src="images/pluto.png"
                alt={sunModalText.goToPluto}
                className="sun-modal-planet-img"
              />
              <span
                className="zoom-ring"
              />
            </Button>
          </div>

        </motion.div>
        {/* Bottom nav for planet buttons on mobile (move outside modal-content for visibility) */}
        <div className="sun-modal-bottom-planet-nav">
          <Button
            className="font-bold rounded-full shadow-lg flex items-center justify-center group sun-modal-planet-btn sun-modal-tab-outline"
            aria-label={sunModalText.goToPluto}
            onClick={e => {
              e.stopPropagation();
              setSelectedPlanet(pluto);
              setSelectedPlanetIdx(1); // Pluto is now static, index 1
            }}
            tabIndex={0}
          >
            <img
              src="images/pluto.png"
              alt={sunModalText.goToPluto}
              className="sun-modal-planet-img"
            />
            <span className="zoom-ring" />
          </Button>
          <div style={{ flex: 1 }} />
          <Button
            className="font-bold rounded-full shadow-lg flex items-center justify-center group sun-modal-planet-btn sun-modal-tab-outline"
            aria-label={sunModalText.goToMercury}
            onClick={e => {
              e.stopPropagation();
              setSelectedPlanet(mercury);
              setSelectedPlanetIdx(0); // Mercury is now static, index 0
            }}
            tabIndex={0}
          >
            <img
              src="images/mercury.png"
              alt={sunModalText.goToMercury}
              className="sun-modal-planet-img"
            />
            <span className="zoom-ring" />
          </Button>
        </div>

        <AnimatePresence>
          {showSunInfoLightbox && (
            <SunInfoLightbox
              open={showSunInfoLightbox}
              sunModalText={sunModalText}
              onClose={() => setShowSunInfoLightbox(false)}
            />
          )}
        </AnimatePresence>

        </div>
    
  );
}

