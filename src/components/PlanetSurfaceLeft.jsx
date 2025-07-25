import React from "react";
import { Button } from "./ui/button";

export default function PlanetSurface({
  planet,
  getImageSrc,
  setShowSurfaceLightbox,
  showSurfaceLightbox,
  isReading,
  handleSpeak
}) {
  if (!planet) return null;
  return (
    <>
      <img
        src={getImageSrc(planet.surfaceImg)}
        alt={planet.name + ' surface'}
        style={{
          width: '388px',
          height: '388px',
          objectFit: 'contain',
          display: 'block',
          marginBottom: '0.8rem',
          borderRadius: '1rem',
          background: '#23223b',
          border: '1px solid #7f00ff',
          boxShadow: '0 0 16px 4px #7f00ff55',
          padding: '0.1rem',
          cursor: 'zoom-in',
        }}
        onClick={() => setShowSurfaceLightbox(true)}
        tabIndex={0}
        aria-label={`Show large surface view of ${planet.name}`}
      />
      <p style={{ color: '#7f00ff', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        {planet.name} surface view
      </p>
      {showSurfaceLightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={e => { if (e.target === e.currentTarget) setShowSurfaceLightbox(false); }}
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
            flexDirection: 'column',
          }}
        >
          <img
            src={getImageSrc(planet.surfaceImg)}
            alt={planet.name + ' surface large'}
            style={{
              maxWidth: '100vw',
              maxHeight: '100vh',
            }}
            aria-label="Close large surface view"
            onClick={e => { e.stopPropagation(); setShowSurfaceLightbox(false); }}
          />
          <span style={{ color: '#ffe680', fontWeight: 700, fontSize: '2rem', marginTop: '1.2rem', textAlign: 'center' }}>{planet.name} surface</span>
        </div>
      )}
    </>
  );
}
