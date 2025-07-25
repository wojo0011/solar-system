import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import NarratorAstronaut from "./NarratorAstronaut";
import "./PlanetModal.css";
import Moons from "./Moons";
import PlanetModalTabs from "./PlanetModalTabs";
import PlanetModalRightNavigation from "./PlanetModalRightNavigation";
import PlanetModalLeftNavigation from "./PlanetModalLeftNavigation";
import PlanetInfoLeft from "./PlanetInfoLeft";
import PlanetSurfaceLeft from "./PlanetSurfaceLeft";
import PlanetInfoRight from "./PlanetInfoRight";
import PlanetSurfaceRight from "./PlanetSurfaceRight";

// Props:
// planet, onClose, getActiveExplorers, getPathRotations, hoveredPlanet, setHoveredPlanet, setShowExplorerInfo, spaceExplorers, speak
export default function PlanetModal({
	planet,
	onClose,
	getActiveExplorers,
	getPathRotations,
	hoveredPlanet,
	setHoveredPlanet,
	setShowExplorerInfo,
	spaceExplorers,
	speak,
	planets = [],
	planetIdx = 0,
	onPrevPlanet,
	onNextPlanet,
	setSelectedPlanet
}) {
	// Filter out the Sun for navigation/indexing logic
	const filteredPlanets = planets.filter(p => p.name !== 'Sun');
	const sun = planets.find(p => p.name === 'Sun');
	// Find the correct index of the current planet in the filtered list
	const filteredIdx = filteredPlanets.findIndex(p => p.name === planet.name);

	const [isReading, setIsReading] = useState(false);
	const [voices, setVoices] = useState([]);
	const [tab, setTab] = useState('info'); // 'info', 'surface', or 'moons'
	const [showSurfaceLightbox, setShowSurfaceLightbox] = useState(false);
	const [showPlanetInfoLightbox, setShowPlanetInfoLightbox] = useState(false);
	const [selectedMoonIdx, setSelectedMoonIdx] = useState(0);

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

	const explorers = getActiveExplorers();

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
		// Wait for the astronaut animation to finish (350ms)
		setTimeout(() => {
			// Use a custom utterance to control events
			const utterance = new window.SpeechSynthesisUtterance(text);
			const voice = getAstroVoice();
			if (voice) utterance.voice = voice;
			utterance.onend = () => setIsReading(false);
			utterance.onerror = () => setIsReading(false);
			window.speechSynthesis.speak(utterance);
		}, 750);
	};

	// Keyboard navigation for left/right arrows and lightbox close
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (showSurfaceLightbox) {
				if (e.key === 'Escape') {
					e.preventDefault();
					setShowSurfaceLightbox(false);
					return;
				}
				// Don't allow left/right to navigate planets while lightbox is open
				return;
			}
			if(showPlanetInfoLightbox) {
				if (e.key === 'Escape') {
					e.preventDefault();
					setShowPlanetInfoLightbox(false);
					return;
				}
				// Don't allow left/right to navigate planets while lightbox is open
				return;
			}

			if (tab !== 'info' && tab !== 'surface') return;
			if (e.key === 'ArrowLeft' && filteredIdx > 0) {
				e.preventDefault();
				onPrevPlanet(filteredIdx - 1, filteredPlanets);
			}
			if (e.key === 'ArrowRight' && filteredIdx < filteredPlanets.length - 1) {
				e.preventDefault();
				onNextPlanet(filteredIdx + 1, filteredPlanets);
			}
		};
		document.addEventListener('keydown', handleKeyDown, true);
		return () => document.removeEventListener('keydown', handleKeyDown, true);
	}, [filteredIdx, filteredPlanets, onPrevPlanet, onNextPlanet, tab, showSurfaceLightbox, showPlanetInfoLightbox]);

	function getImageSrc(img) {
		if (!img) return '';
		if (img.startsWith('http') || img.startsWith('data:')) return img;
		// If already relative, just return
		if (!img.startsWith('/')) return img;
		// Remove leading slash for GitHub Pages
		return img.replace(/^\//, '');
	}

	return (
		<>
			<NarratorAstronaut isVisible={isReading}/>
			<div
				className="planet-modal-overlay"
				onClick={e => {
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
				<motion.div
					initial={{ opacity: 0, scale: 0.85 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.85 }}
					transition={{ duration: 0.45, ease: 'easeOut' }}
					className="planet-modal"
					onClick={e => e.stopPropagation()}
				>
					{/* Close button in top right */}
					<Button
						className="close-btn"
						onClick={onClose}
						aria-label="Close"
					>
						<span className="close-x">×</span>
					</Button>
					
					<PlanetModalTabs setTab={setTab} tab={tab} />
					
					{/* Right navigation arrow */}
					<PlanetModalRightNavigation 
					 	planet={planet}
						sun={sun}
						filteredIdx={filteredIdx}
						filteredPlanets={filteredPlanets}
						getImageSrc={getImageSrc}
						onNextPlanet={onNextPlanet}
						planets
					/>
					
					<PlanetModalLeftNavigation
						planet={planet}
						planets={planets}
						sun={sun}
						filteredIdx={filteredIdx}
						filteredPlanets={filteredPlanets}
						getImageSrc={getImageSrc}
						onPrevPlanet={onPrevPlanet}
						setSelectedPlanet={setSelectedPlanet}
					/>
					
					{tab !== 'moons' ? (
						<>
							<div className={(planet.name === 'Pluto' ? 'pluto-modal-content-left ' : '') + ''} style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: 420 }}>

								<h2 style={{ color: '#ffe680', fontSize: '2.1rem', fontWeight: 700, textAlign: 'center' }}>
									{planet.name}
								</h2>
								
								
								{/* Tab content, fixed min height to avoid modal resize */}
								{(() => {
									let leftTabContent = null;
									if (tab === 'info') {
										leftTabContent = (
											<PlanetInfoLeft
												planet={planet}
												setShowPlanetInfoLightbox={setShowPlanetInfoLightbox}
												isReading={isReading}
												handleSpeak={handleSpeak}
												showPlanetInfoLightbox={showPlanetInfoLightbox}
												getImageSrc={getImageSrc}
											/>
										);
									} else if (tab === 'surface') {
										leftTabContent = (
											<PlanetSurfaceLeft
												planet={planet}
												getImageSrc={getImageSrc}
												setShowSurfaceLightbox={setShowSurfaceLightbox}
												showSurfaceLightbox={showSurfaceLightbox}
												isReading={isReading}
												handleSpeak={handleSpeak}
											/>
										);
									} else if (tab === 'moons') {
										leftTabContent = (
											<PlanetInfoLeft 
												planet={planet} 
												selectedMoonIdx={selectedMoonIdx} 
												setSelectedMoonIdx={setSelectedMoonIdx} 
											/>
										);
									}
									return (
										<div style={{ minHeight: 340, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
											{leftTabContent}
										</div>
									);
								})()}
							</div>
							{/* Right: Info and explorers */}
							<div style={{ flex: '1 1 0', minWidth: 0, position: 'relative', minHeight: 420 }}>
								{/* Show explorer flying around the modal if any explorer matches this planet */}
								{explorers.map((explorer, i) => {
									const rotations = getPathRotations(explorer.path);
									return (
										<motion.img
											key={explorer.name}
											src={explorer.img}
											alt={explorer.name}
											style={{
												position: 'absolute',
												left: '50%',
												top: '0%',
												width: 64,
												height: 64,
												marginLeft: -32,
												marginTop: -32,
												zIndex: 9999,
												cursor: 'pointer',
												pointerEvents: 'auto',
												border: hoveredPlanet === explorer.name ? '2px solid #fefcbf' : '2px solid transparent',
												boxShadow: hoveredPlanet === explorer.name ? '0 2px 8px 0 #0008' : '0 2px 8px 0 transparent',
												borderRadius: '50%',
												background:  hoveredPlanet === explorer.name ? '#22223b' : 'transparent',
												transition: 'box-shadow 0.2s, border-color 0.2s, cursor 0.2s',
											}}
											animate={{
												x: explorer.path.map(p => p.x),
												y: explorer.path.map(p => p.y),
												rotate: rotations,
											}}
											transition={{
												duration: 12,
												repeat: Infinity,
												ease: "easeInOut",
											}}
											onClick={() => setShowExplorerInfo(spaceExplorers.findIndex(e => e.name === explorer.name))}
											onMouseEnter={() => setHoveredPlanet(explorer.name)}
											onMouseLeave={() => setHoveredPlanet(null)}
										/>
									);
								})}
								
								
								{(() => {
									let rightTabContent = null;
									if (tab === 'info') {
										rightTabContent = (
											<PlanetInfoRight
												planet={planet}
												isReading={isReading}
												handleSpeak={handleSpeak}
											/>
										);
									} else if (tab === 'surface') {
										rightTabContent = (
											<PlanetSurfaceRight
												planet={planet}
												isReading={isReading}
												handleSpeak={handleSpeak}
											/>
										);
									} else if (tab === 'moons') {
										rightTabContent = (
											<PlanetInfoLeft 
												planet={planet} 
												selectedMoonIdx={selectedMoonIdx} 
												setSelectedMoonIdx={setSelectedMoonIdx} 
											/>
										);
									}
									return rightTabContent;
								})()}
							</div>
						</>
					) : null }
					
					{ tab === 'moons' ? (
						<>
						<h2 style={{ color: '#ffe680', fontSize: '2.1rem', fontWeight: 700, textAlign: 'center' }}>
							{planet.moonsTitle}
						</h2>
						<div 
							id="moons-container"
							style={{
								width: '100%',
								minHeight: 340,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: '1rem',
								padding: '1.5rem 0',
								marginBottom: '1.5rem',
							}}
						>
							<Moons planet={planet} selectedMoonIdx={selectedMoonIdx} setSelectedMoonIdx={setSelectedMoonIdx} />
						</div>
						</>
					) :  null }
					
				</motion.div>
			</div>
		</>
	);
}
