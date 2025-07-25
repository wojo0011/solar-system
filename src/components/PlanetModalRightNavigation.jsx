import PropTypes from "prop-types";
import { Button } from "./ui/button";
import "./PlanetModalNavigation.css";

export default function PlanetModalRightNavigation({
  planet,
  sun,
  filteredIdx,
  filteredPlanets,
  getImageSrc,
  onNextPlanet,
  planets
}) {
  // Show Sun button if Pluto
  if (planet.name === "Pluto") {
    return (
      <div className="planet-modal-navigation-arrow-container right">
        <Button
          className="planet-modal-navigation-arrow-container-button group sun"
          aria-label={`Go to ${sun.name}`}
          onClick={e => {
            e.stopPropagation();
            onNextPlanet(0, planets);
          }}
        >
          <img
            src={getImageSrc(sun.img)}
            alt={`Go to ${sun.name}`}
            className="pluto-planet-modal-sun-img"
          />
          <span className="zoom-ring pluto-sun-zoom-ring" />
        </Button>
      </div>
    );
  }
  // Show next planet button if not last
  if (filteredIdx < filteredPlanets.length - 1) {
    return (
      <div className="planet-modal-navigation-arrow-container right">
        <Button
          className="planet-modal-navigation-arrow-container-button group"
          aria-label={`Go to ${filteredPlanets[filteredIdx + 1].name}`}
          onClick={e => {
            e.stopPropagation();
            onNextPlanet(filteredIdx + 1, filteredPlanets);
          }}
        >
          <img
            src={getImageSrc(filteredPlanets[filteredIdx + 1].img)}
            alt={`Go to ${filteredPlanets[filteredIdx + 1].name}`}
            className="next-planet-button"
          />
          <span className="zoom-ring next-planet-zoom-ring" />
        </Button>
      </div>
    );
  }
  return null;
}

PlanetModalRightNavigation.propTypes = {
  planet: PropTypes.object.isRequired,
  sun: PropTypes.object.isRequired,
  filteredIdx: PropTypes.number.isRequired,
  filteredPlanets: PropTypes.array.isRequired,
  getImageSrc: PropTypes.func.isRequired,
  onNextPlanet: PropTypes.func.isRequired,
  planets: PropTypes.array.isRequired
};

