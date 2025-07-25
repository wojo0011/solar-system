import { Button } from "./ui/button";

export default function PlanetInfoLeft({ 
    planet, 
    setShowPlanetInfoLightbox, 
    isReading, 
    handleSpeak, 
    showPlanetInfoLightbox,
    getImageSrc
}) {
    if (!planet) return null;
    return (
        <>
            <img
                src={getImageSrc(planet.img)}
                alt={planet.name}
                style={{
                    width: '320px',
                    height: '320px',
                    objectFit: 'contain',
                    display: 'block',
                    marginBottom: '0.8rem',
                    cursor: 'zoom-in',
                    borderRadius: '1rem',
                    backround: 'transparent',
                    border: '0.15rem solid #000',
                    outline: '1px solid #ffe680',
                    boxShadow: '0 0 16px 4px #ffe68055',
                    padding: '2rem',
                }}
                onClick={() => setShowPlanetInfoLightbox(true)}
                tabIndex={0}
                aria-label={`Show large view of ${planet.name}`}
            />
            {planet.description && (
                <p style={{ color: '#ffe680', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    {planet.description}	
                </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
                <Button
                    className={'read-aloud-button' + (isReading ? ' reading' : '')}
                    onClick={() => handleSpeak(planet.description)}
                >
                    {isReading ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
                </Button>
            </div>

            {showPlanetInfoLightbox && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={e => { if (e.target === e.currentTarget) setShowPlanetInfoLightbox(false); }}
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
                            src={getImageSrc(planet.img)}
                            alt={planet.name + ' surface large'}
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                borderRadius: '2rem',
                            }}
                            aria-label="Close large surface view"
                            onClick={e => { e.stopPropagation(); setShowPlanetInfoLightbox(false); }}
                        />
                        <span style={{ color: '#ffe680', fontWeight: 700, fontSize: '2rem', marginTop: '1.2rem', textAlign: 'center' }}>{planet.name}</span>
                    </div>
                </div>
            )}
        </>
    );
}