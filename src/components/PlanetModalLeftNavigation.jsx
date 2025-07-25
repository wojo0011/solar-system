import React from "react";
import { Button } from "./ui/button";

export default function PlanetModalLeftNavigation({
  planet,
  planets,
  filteredIdx,
  filteredPlanets,
  getImageSrc,
  onPrevPlanet,
  setSelectedPlanet
}) {
  // Mercury: show Sun button
  if (planet.name === "Mercury") {
    return (
      <div className="mercury-button-container">
        <Button
          className="font-bold rounded-full flex items-center justify-center group mercury-sun-button"
          aria-label="Back to Sun"
          onClick={e => {
            e.stopPropagation();
            const sun = planets.find(p => p.name === "Sun");
            setSelectedPlanet(sun);
          }}
        >
          <img
            src="images/sun.png"
            alt="Go to Sun"
            className="mercury-sun-img"
          />
          <span className="zoom-ring mercury-sun-zoom-ring" />
          <style>{`.group:hover .zoom-ring { opacity: 1 !important; }`}</style>
        </Button>
      </div>
    );
  }
  // Other planets: show previous planet button if not first
  if (filteredIdx > 0) {
    return (
      <div className="previous-planet-container">
        <Button
          className="font-bold rounded-full flex items-center justify-center group"
          style={{
            background: 'transparent',
            width: '3.7rem',
            height: '3.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'visible',
            opacity: 1,
            outline: 'none',
            paddingRight: '2em',
            transition: 'background 0.2s, color 0.2s',
          }}
          aria-label={`Go to ${filteredPlanets[filteredIdx - 1].name}`}
          onClick={e => {
            e.stopPropagation();
            onPrevPlanet(filteredIdx - 1, filteredPlanets);
          }}
        >
          <img
            src={getImageSrc(filteredPlanets[filteredIdx - 1].img)}
            alt={`Go to ${filteredPlanets[filteredIdx - 1].name}`}
            style={{
              width: '3.7rem',
              height: '3.7rem',
              display: 'block',
              objectFit: 'cover',
              pointerEvents: 'none',
              borderRadius: '50%'
            }}
          />
          <span
            className="zoom-ring"
            style={{
              position: 'absolute',
              top: '50%',
              left: '30%',
              transform: 'translate(-50%, -50%)',
              width: '95%',
              height: '95%',
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
    );
  }
  // Otherwise, render nothing
  return null;
}
