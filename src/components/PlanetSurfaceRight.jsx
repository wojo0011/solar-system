import React from "react";
import { Button } from "./ui/button";

export default function PlanetSurfaceRight({
  planet,
  isReading,
  handleSpeak
}) {
  if (!planet) return null;
  return (
    <>
      <h3 style={{ color: '#ffe680', fontWeight: 700, fontSize: '1.35rem', marginBottom: '0.7rem', textAlign: 'left', letterSpacing: '0.01em' }}>
        {planet.surfaceTitle}
      </h3>
      <p style={{ color: '#fff', fontWeight: 500, fontSize: '1.1rem', marginBottom: '1.2rem', textAlign: 'left' }}>
        {planet.surfaceDetails}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
        {planet.tempCool && (
          <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '1.05rem' }}>Coolest: {planet.tempCool}</span>
        )}
        {planet.tempHot && (
          <span style={{ color: '#f87171', fontWeight: 600, fontSize: '1.05rem' }}>Hottest: {planet.tempHot}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
        <Button
          className={'read-aloud-button' + (isReading ? ' reading' : '')}
          onClick={() => handleSpeak(planet.surfaceDetails)}
        >
          {isReading ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
        </Button>
      </div>
    </>
  );
}
