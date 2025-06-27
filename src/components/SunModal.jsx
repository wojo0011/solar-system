import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import NarratorAstronaut from "./NarratorAstronaut";

export default function SunModal({ sun, onClose, speak }) {
  const [isReading, setIsReading] = useState(false);
  const [voices, setVoices] = useState([]);

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
    <>
      <div
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
          onClose();
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
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.2rem',
              right: '1.2rem',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #22223b 0%, #4a4e69 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.5rem',
              border: 'none',
              boxShadow: '0 0 12px 2px #4a4e6955',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
              padding: 0,
            }}
            aria-label="Close"
          >
            ×
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
              }}
            />
            <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              {sun.description}
            </p>
          </div>
          {/* Right: Info */}
          <div style={{ flex: '1 1 0', minWidth: 0, position: 'relative' }}>
            <p style={{ color: '#ffe680', fontSize: '1.1rem', marginBottom: 0, textAlign: 'center' }}>
              Type: {sun.type}
            </p>
            <p style={{ color: '#4ade80', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Age: {sun.age}
            </p>
            <p style={{ color: '#4ade80', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Expected Lifetime: {sun.lifetime}
            </p>
            <p style={{ color: '#60a5fa', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Diameter: {sun.size}
            </p>
            <p style={{ color: '#f87171', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Mass: {sun.mass}
            </p>
            <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Temperature: {sun.temperature}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
              <Button
                style={{
                  background: isReading
                    ? 'linear-gradient(90deg, #7f00ff 0%, #3a3aff 100%)'
                    : 'linear-gradient(90deg, #3a3aff 0%, #7f00ff 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 0 12px 2px #3a3aff55',
                  opacity: 1,
                  transition: 'background 0.2s, opacity 0.2s',
                }}
                onClick={() => handleSpeak(sun.description)}
              >
                {isReading ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
