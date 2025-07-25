import React from "react";
import { Button } from "./ui/button";

export default function PlanetInfoRight({
  planet,
  isReading,
  handleSpeak
}) {
  if (!planet) return null;
  return (
    <>
      <p style={{ color: '#ffe680', fontSize: '1.1rem', marginBottom: 0, textAlign: 'center' }}>
        {planet.name !== "Sun"
          ? `Distance from Sun: ${planet.distanceFromSun.toLocaleString()} million km`
          : planet.size
            ? `Size: ${planet.size}`
            : ''}
      </p>
      {planet.size && (
        <p style={{ color: '#4ade80', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
          Size: {planet.size}
        </p>
      )}
      {planet.mass && (
        <p style={{ color: '#4ade80', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
          Mass: {planet.mass}
        </p>
      )}
      {planet.yearLength && (
        <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
          Year Length: {planet.yearLength}
        </p>
      )}
      {planet.dayLength && (
        <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          Day Length: {planet.dayLength}
        </p>
      )}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
        <Button
          className={'read-aloud-button' + (isReading ? ' reading' : '')}
          onClick={() => handleSpeak(
            planet.name + "'s Distance from the Sun is:" + planet.distanceFromSun + " million kilometers" +
            (planet.size ? ', with a Size of: ' + planet.size : '') +
            (planet.mass ? ', and a Mass of: ' + planet.mass : '') +
            (planet.yearLength ? ', a Year on ' + planet.name + ' lasts ' + planet.yearLength : '') +
            (planet.dayLength ? ', And a day on ' + planet.name + ' lasts ' + planet.dayLength : '')
          )}
        >
          {isReading ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
        </Button>
      </div>
    </>
  );
}
