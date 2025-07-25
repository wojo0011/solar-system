import './PlanetModalTabs.css';
import PropTypes from 'prop-types';

export default function PlanetModalTabs({ setTab, tab }) {

  return (
    
    <div className="planet-modal-tabs">
        <button
            className={ 'planet-modal-tab-info' + (tab === 'info' ? ' active' : '') }
            onClick={() => setTab('info')}
            aria-label="Planet Info Tab"
        >
            🪐 Info
        </button>
        <button
            className={ 'planet-modal-tab-surface' + (tab === 'surface' ? ' active' : '') }
            onClick={() => setTab('surface')}
            aria-label="Surface View Tab"
        >
            🏜️ Surface
        </button>
        <button
            className={
                'planet-modal-tab-moons' +
                (tab === 'moons' ? ' active' : '')
            }
            onClick={() => setTab('moons')}
            aria-label="Moons Tab"
        >
            🌙 Moons
        </button>
    </div>
  );
}

PlanetModalTabs.propTypes = {
  setTab: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired,
};

