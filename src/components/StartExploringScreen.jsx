import React from "react";
import { Button } from "./ui/button";
import NarratorAstronaut from "./NarratorAstronaut";

// AnimatedMessage: cycles through messages with fade-in animation
function AnimatedMessage({ messages, currentIndex }) {
  return (
    <div
      key={currentIndex}
      style={{
        color: '#ffe680',
        fontSize: '1.35rem',
        maxWidth: 600,
        textAlign: 'center',
        marginBottom: '2.5rem',
        lineHeight: 1.6,
        fontWeight: 500,
        letterSpacing: 0.1,
        minHeight: 80,
        transition: 'opacity 0.7s',
        opacity: 1,
        animation: 'fadeIn 0.7s',
      }}
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

export default function StartExploringScreen({ onStart }) {
  const [isReading, setIsReading] = React.useState(false);
  const [voices, setVoices] = React.useState([]);
  const [msgIndex, setMsgIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  const screenRef = React.useRef(null);
  const messages = [
    "Welcome to our amazing Solar System! 🌞🚀",
    "There are planets big and small, each with cool secrets.",
    "Some are rocky, some are gassy, and some are icy!",
    "The Sun is our star, giving us light and warmth.",
    "Are you ready to blast off and explore? Let's go!"
  ];

  // Cycle messages every 6s (slower for kids)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [messages.length]);

  // Load voices on mount and when voiceschanged fires
  React.useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  React.useEffect(() => {
    const handleStart = () => setIsReading(true);
    window.speechSynthesis.addEventListener('start', handleStart);
    return () => {
      window.speechSynthesis.removeEventListener('start', handleStart);
    };
  }, []);

  const getAstroVoice = () => {
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
      className="flex flex-col items-center justify-center min-h-screen bg-black"
      style={{
        opacity: 1,
        transform: 'scale(1)',
        transition: 'opacity 0.7s, transform 0.7s',
      }}
    >
      <NarratorAstronaut isVisible={isReading} style={{ cursor: 'pointer' }} />
      <h1 className="text-5xl font-bold text-white mb-8 z-10" style={{ textAlign: 'center' }}>
        🌞 Meet Our Solar System!
      </h1>
      <AnimatedMessage messages={messages} currentIndex={msgIndex} />
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
          marginBottom: '2.5rem',
        }}
        onClick={() => handleSpeak(messages[msgIndex])}
      >
        {isReading ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
      </Button>
      <Button
        className="text-5xl font-bold px-20 py-7 rounded-full shadow-lg mb-10 z-50 hover:shadow-2xl transition duration-300"
        style={{
          background: 'linear-gradient(90deg, #ffe259 0%, #ffa751 100%)',
          color: '#22223b',
          fontWeight: 800,
          fontSize: '2rem',
          padding: '1.5rem 3.5rem',
          borderRadius: '9999px',
          cursor: 'pointer',
          border: 'none',
          boxShadow: '0 0 24px 6px #ffe68055',
          opacity: 1,
          transition: 'background 0.2s, opacity 0.2s',
        }}
        onClick={handleStartWithAnimation}
      >
        <span role="img" aria-label="Rocket" style={{ marginRight: 16, fontSize: '2.2rem', verticalAlign: 'middle' }}>🚀</span>
        Start Exploring!
      </Button>
    </div>
  );
}
