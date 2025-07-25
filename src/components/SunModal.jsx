import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import NarratorAstronaut from "./NarratorAstronaut";

export default function SunModal({ planets, speak, setSelectedPlanet, setSelectedPlanetIdx }) {
  const [isReading, setIsReading] = useState(false);
  const [voices, setVoices] = useState([]);
  const [showSunInfoLightbox, setShowSunInfoLightbox] = useState(false);
  
    // Find the Sun, Mercury, and Pluto objects from the planets array
  const sun = planets.find(p => p.name === 'Sun');
  const mercury = planets.find(p => p.name === 'Mercury');
  const pluto = planets.find(p => p.name === 'Pluto');

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

  return (
      <dialog
        open
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          padding: 0,
          margin: 0,
        }}
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
            setSelectedPlanet(null);
          }
        }}
      >
        <NarratorAstronaut isVisible={isReading} />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          style={{
            background: '#18181b',
            borderRadius: '1.5rem',
            padding: '2.5rem 2.5rem',
            boxShadow: '0 8px 32px #000a',
            maxWidth: 700,
            textAlign: 'left',
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '2.5rem',
          }}
          onClick={e => e.stopPropagation()}
        >
          <Button
            onClick={() => {setSelectedPlanet(null) }}
            className="close-btn"
            aria-label="Close"
          >
            <span className="close-x">×</span>
          </Button>
          {/* Left: Name, Sun image, Description */}
          <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: '#ffe680', fontSize: '2.1rem', fontWeight: 700, marginBottom: '0.8rem', textAlign: 'center' }}>
              {sun.name}
            </h2>
            <img
                src={sun.img}
                alt={sun.name}
                style={{
                    width: '340px',
                    height: '340px',
                    objectFit: 'contain',
                    display: 'block',
                    marginBottom: '0.8rem',
                    cursor: 'zoom-in',
                    borderRadius: '1rem',
                    background: 'transparent',
                    border: '0.15rem solid #000',
                    outline: '1px solid #ffe680',
                    boxShadow: '0 0 16px 4px #ffe68055',
                    padding: '2rem',
                }}
                onClick={() => setShowSunInfoLightbox(true)}
                tabIndex={0}
                aria-label={`Show large view of ${sun.name}`}
            />
            <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              {sun.description}
            </p>
          </div>
          {/* Right: Info */}
          <div style={{ flex: '1 1 0', minWidth: 0, position: 'relative' }}>
            <p style={{ color: '#ffe680', fontSize: '1.1rem', marginBottom: 0 }}>
              Type: {sun.type}
            </p>
            <p style={{ color: '#60a5fa', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Age: {sun.age}
            </p>
            <p style={{ color: '#60a5fa', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Expected Lifetime: {sun.lifetime}
            </p>
            <p style={{ color: '#4ade80', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Diameter: {sun.size}
            </p>
            <p style={{ color: '#4ade80', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Mass: {sun.mass}
            </p>
            <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Temperature: 
              <p style={{ color: '#f87171', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                Core: {sun.tempHot}
              </p>
              <p style={{ color: '#60a5fa', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                Surface: {sun.tempCool}
              </p>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
              <Button
                className={'read-aloud-button' + (isReading ? ' reading' : '')}
                onClick={() => handleSpeak(sun.description)}
              >
                {isReading ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
              </Button>
            </div>
          </div>
          {/* Planet button on the right: open Mercury modal */}
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '-3.7rem',
            transform: 'translateY(-50%)',
            zIndex: 10003,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            pointerEvents: 'auto',
          }}>
            <Button
              className="font-bold rounded-full shadow-lg flex items-center justify-center group"
              style={{
                background: 'transparent',
                width: '3.2rem',
                height: 'rem',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'visible',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
              aria-label="Go to Mercury"
              onClick={e => {
                e.stopPropagation();
                setSelectedPlanet(mercury);
                setSelectedPlanetIdx(planets.findIndex(p => p.name === 'Mercury'));
              }}
            >
              <img
                src="images/mercury.png"
                alt="Go to Mercury"
                style={{
                  width: '3.2rem',
                  height: '3.2rem',
                  display: 'block',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
              <span
                className="zoom-ring"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '3px solid #ffe680',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none',
                }}
              />
              <style>{`.group:hover .zoom-ring { opacity: 1 !important; }`}</style>
            </Button>
          </div>
          {/* Previous button on the left: open Pluto modal */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '-3.7rem',
            transform: 'translateY(-50%)',
            zIndex: 10003,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            pointerEvents: 'auto',
          }}>
            <Button
              className="font-bold rounded-full shadow-lg flex items-center justify-center group"
              style={{
                background: 'transparent',
                width: '3.2rem',
                height: '3.2rem',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'visible',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
              aria-label="Go to Pluto"
              onClick={e => {
                e.stopPropagation();
                setSelectedPlanet(pluto);
                setSelectedPlanetIdx(planets.findIndex(p => p.name === 'Pluto'));
              }}
            >
              <img
                src="images/pluto.png"
                alt="Go to Pluto"
                style={{
                  width: '3.2rem',
                  height: '3.2rem',
                  display: 'block',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
              <span
                className="zoom-ring"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '3px solid #ffe680',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none',
                }}
              />
              <style>{`.group:hover .zoom-ring { opacity: 1 !important; }`}</style>
            </Button>
          </div>

            {showSunInfoLightbox && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={e => { if (e.target === e.currentTarget) setShowSunInfoLightbox(false); }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.92)',
                        zIndex: 20000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-out',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img
                            src={sun.img}
                            alt={sun.name + ' surface large'}
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                borderRadius: '2rem',
                            }}
                            aria-label="Close large surface view"
                            onClick={e => { e.stopPropagation(); setShowSunInfoLightbox(false); }}
                        />
                        <span style={{ color: '#ffe680', fontWeight: 700, fontSize: '2rem', marginTop: '1.2rem', textAlign: 'center' }}>{sun.name}</span>
                    </div>
                </div>
            )}

        </motion.div>
      </dialog>
    
  );
}

