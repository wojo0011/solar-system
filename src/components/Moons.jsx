import "./PlanetModal.css";
import './Moons.css'; // Assuming you have a separate CSS file for Moons component

export default function Moons({ planet, selectedMoonIdx, setSelectedMoonIdx }) {
  console.log('Moons component rendered with planet:', planet, 'selectedMoonIdx:', selectedMoonIdx, planet?.moons);
    if (!planet || !Array.isArray(planet?.moons)) {
    return (
      <p style={{ color: '#60a5fa', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', marginTop: '2rem' }}>
        {planet?.name || 'This planet'} has no moons! 🚀
      </p>
    );
  }

  const moon = planet?.moons[selectedMoonIdx] || planet?.moons[0];

  function getImageSrc(img) {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    if (!img.startsWith('/')) return img;
    return img.replace(/^\//, '');
  }

  // Show moon selector in pages of 4 per row
  const moonsPerPage = 4;
  const page = Math.floor(selectedMoonIdx / moonsPerPage);
  const startIdx = page * moonsPerPage;
  const endIdx = startIdx + moonsPerPage;
  const visibleMoons = planet?.moons?.slice(startIdx, endIdx);
  const showSelector = planet?.moons?.length > 1;

  return (
    <>
      {showSelector && (
        <div className="planet-moons-horizontal-list planet-moons-horizontal-list--under-title" style={{ justifyContent: 'flex-start' }}>
          <button
            className={
              'planet-moon-selector-btn arrow-btn'
            }
            onClick={() => startIdx >= 0 && setSelectedMoonIdx(startIdx - 1)}
            aria-label="Previous moons"
            style={{ minWidth: 40, minHeight: 90, fontSize: '2rem', fontWeight: 700, opacity:  1, pointerEvents: startIdx === 0 ? 'none' : 'auto' }}
            disabled={startIdx === 0}
          >
            ◀
          </button>
          {visibleMoons.map((moon, idx) => (
            <button
              key={moon.name}
              className={
                'planet-moon-selector-btn' + (selectedMoonIdx === startIdx + idx ? ' selected' : '')
              }
              onClick={() => setSelectedMoonIdx(startIdx + idx)}
              aria-label={`Show details for ${moon.name}`}
            >
              <img
                src={getImageSrc(moon.img)}
                alt={moon.name}
                className="planet-moon-selector-img"
              />
              <span className="planet-moon-selector-label">{moon.name}</span>
            </button>
          ))}
          {/* Add invisible dummies to keep layout stable if less than 4 moons on this page */}
          {Array.from({ length: moonsPerPage - visibleMoons.length }).map((_, idx) => (
            <div
              key={`dummy-${idx}`}
              className="planet-moon-selector-btn dummy-holder"
              style={{ visibility: 'hidden', pointerEvents: 'none' }}
            />
          ))}
          <button
            className={
              'planet-moon-selector-btn arrow-btn' + (endIdx >= planet.moons.length ? ' disabled' : '')
            }
            onClick={() => endIdx < planet.moons.length && setSelectedMoonIdx(endIdx)}
            aria-label="Next moons"
            style={{ minWidth: 40, minHeight: 90, fontSize: '2rem', fontWeight: 700, opacity: endIdx >= planet.moons.length ? 0.2 : 1, pointerEvents: endIdx >= planet.moons.length ? 'none' : 'auto' }}
            disabled={endIdx >= planet.moons.length}
          >
            ▶
          </button>
        </div>
      )}
      <div style={{ width: '100%', color: '#60a5fa', fontWeight: 700, fontSize: '1.25rem', marginBottom: 0, padding: 0, textAlign: 'left' }}>{moon.name}</div>
      <div className="planet-moon-card" style={{ borderRadius: '1.2rem', boxShadow: '0 0 12px 2px #60a5fa55', padding: '2rem', width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #60a5fa', position: 'relative' }}>
        <img
          src={getImageSrc(moon.img)}
          alt={moon.name}
          style={{ width: '328px', height: '320px', objectFit: 'contain', borderRadius: '50%' }}
        />
      </div>
      {/* <p style={{ color: '#fff', fontWeight: 500, fontSize: '1.08rem', textAlign: 'center', marginTop: 0 }}>{moon.description}</p> */}
    </>
  );
}
