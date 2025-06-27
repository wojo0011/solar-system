import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import "./SolarSystem.css";
import PlanetModal from "./PlanetModal";
import SunModal from "./SunModal";
import ExplorerModal from "./ExplorerModal";
import planets from "../data/planets.json";
import spaceExplorers from "../data/spaceExplorers.json";
import StartExploringScreen from "./StartExploringScreen";

export default function SolarSystemHome() {
	const [selectedPlanet, setSelectedPlanet] = useState(null);
	const [selectedPlanetIdx, setSelectedPlanetIdx] = useState(null);
	const [exploreMode, setExploreMode] = useState(false);
	const [stars, setStars] = useState([]);
	const [shootingStars, setShootingStars] = useState([]);
	const [sparkles, setSparkles] = useState([]);
	const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
	const [caughtStars, setCaughtStars] = useState(0);
	const [hoveredPlanet, setHoveredPlanet] = useState(null);
	const [zoom, setZoom] = useState(1);
	const [showExplorerInfo, setShowExplorerInfo] = useState(null); // replaces showShuttleInfo
	const [explorerProgress, setExplorerProgress] = useState({});
	const audioRef = useRef(null);
	const clickSoundRef = useRef(null);
	const sparkleSoundRef = useRef(null);
	const hitSoundRef = useRef(null);
	const explorerRequestRefs = useRef({});

	// Place these hooks at the top level for all explorers
	const explorerLocalProgress = useRef({});
	const explorerAnimReq = useRef({});
	const [explorerDummy, setExplorerDummy] = useState(0); // force re-render for explorer animation
	const explorerPausedProgress = useRef({}); // store paused progress on hover
	const [hoveredStar, setHoveredStar] = useState(null); // <-- add this at the top-level, outside the map

	useEffect(() => {
		audioRef.current = new Audio("/background-music.mp3");
		audioRef.current.loop = true;
		audioRef.current.onerror = () => {
			console.warn("Background music file not found or cannot be played.");
			audioRef.current = null;
		};
		clickSoundRef.current = new Audio("/click-sound.mp3");
		clickSoundRef.current.onerror = () => {
			console.warn("Click sound file not found or cannot be played.");
			clickSoundRef.current = null;
		};
		sparkleSoundRef.current = new Audio("/sparkle-sound.mp3");
		sparkleSoundRef.current.onerror = () => {
			console.warn("Sparkle sound file not found or cannot be played.");
			sparkleSoundRef.current = null;
		};
		hitSoundRef.current = new Audio("/Hit7.wav");
		hitSoundRef.current.onerror = () => {
			console.warn("Hit sound file not found or cannot be played.");
			hitSoundRef.current = null;
		};
		return () => {
			if (audioRef.current) audioRef.current.pause();
		};
	}, []);

	useEffect(() => {
		const generatedStars = Array.from({ length: 200 }).map(() => ({
			top: Math.random() * 100,
			left: Math.random() * 100,
			size: Math.random() * 2 + 1,
			opacity: Math.random() * 0.5 + 0.5,
			color: `hsl(${Math.random() * 60 + 200}, 100%, ${
				Math.random() * 40 + 60
			}%)`,
			duration: Math.random() * 5 + 2,
			delay: Math.random() * 5,
		}));
		setStars(generatedStars);
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			setShootingStars((prev) => [
				...prev,
				{
					id: Date.now(),
					top: Math.random() * 80,
					left: Math.random() * 80,
					angle: Math.random() * 30 - 15,
					speed: Math.random() * 0.8 + 0.8,
				},
			]);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	const startMusic = () => {
		if (audioRef.current) audioRef.current.play();
	};

	const playClickSound = () => {
		if (clickSoundRef.current) {
			clickSoundRef.current.currentTime = 0;
			clickSoundRef.current.play();
		}
	};

	const playSparkleSound = () => {
		if (sparkleSoundRef.current) {
			sparkleSoundRef.current.currentTime = 0;
			sparkleSoundRef.current.play();
		}
	};

	const playHitSound = () => {
		if (hitSoundRef.current) {
			hitSoundRef.current.currentTime = 0;
			hitSoundRef.current.play();
		}
	};

	const speak = (text) => {
		const utterance = new SpeechSynthesisUtterance(text);
		speechSynthesis.speak(utterance);
	};

	const handleMouseMove = (e) => {
		setMouse({
			x: e.clientX / window.innerWidth,
			y: e.clientY / window.innerHeight,
		});
	};

	const handleShootingStarClick = (star, event) => {
		// Get mouse position in viewport
		const x = event.clientX;
		const y = event.clientY;
		// Adjust for scroll position and center of the clickable area (30px)
		const adjustedX = x-1;
		const adjustedY = y-20.5;
		setCaughtStars(caughtStars + 1);
		setSparkles((prev) => [
			...prev,
			{
				id: Date.now(),
				// Convert to percent of viewport for consistency with sparkles
				top: (adjustedY / window.innerHeight) * 100,
				left: (adjustedX / window.innerWidth) * 100,
			},
		]);
		playSparkleSound();
		playHitSound();
	};

	// Remove shuttlePath and shuttleRotations, use explorer.path and getPathRotations instead

	const minZoom = 0.4;
	const maxZoom = 3;
	const zoomLevels = 10;
	const zoomStep = (maxZoom - minZoom) / (zoomLevels - 1);

	// const getPlanetScreenPosition = (planetName) => {
	// 	// Only works in explore mode and when not selectedPlanet
	// 	if (!exploreMode || selectedPlanet) return null;
	// 	const container = document.getElementById('solar-system-container');
	// 	if (!container) return null;
	// 	const rect = container.getBoundingClientRect();
	// 	const centerX = rect.left + rect.width / 2;
	// 	const centerY = rect.top + rect.height / 2;
	// 	const distanceRatio = planetDistances[planetName] / maxDistance;
	// 	const orbitRadius = maxRadius * distanceRatio * zoom;
	// 	// Planets are placed at angle 0 (to the right of the sun)
	// 	return {
	// 		x: centerX + orbitRadius,
	// 		y: centerY
	// 	};
	// };

	const handleWheelZoom = (e) => {
		e.preventDefault();
		const container = document.getElementById('solar-system-container');
		if (!container) return;
		setZoom((prevZoom) => {
			const idx = Math.round((prevZoom - minZoom) / zoomStep);
			const nextIdx = Math.max(0, Math.min(zoomLevels - 1, idx - Math.sign(e.deltaY)));
			return minZoom + nextIdx * zoomStep;
		});
	};

	// Realistic planet distances (in millions of km, for ratio only)
	const planetDistances = {
		Mercury: 58,
		Venus: 108,
		Earth: 150,
		Mars: 228,
		Jupiter: 778,
		Saturn: 1430,
		Uranus: 2870,
		Neptune: 4500,
		Pluto: 5900,
	};
	const baseRadius = 120; // px, Mercury's distance
	const maxDistance = planetDistances['Pluto'];
	const maxRadius = 1000; // px, Pluto's distance

	// Calculate pan offset to center a planet
	function getPanOffset(planetName) {
		if (!planetName || planetName === 'Sun') return { x: 0, y: 0 };
		const distanceRatio = planetDistances[planetName] / maxDistance;
		const orbitRadius = maxRadius * distanceRatio;
		return { x: orbitRadius, y: 0 };
	}

	const labelFontSizes = [
		{ zoom: 0.4, size: 4.5 },
		{ zoom: 0.6, size: 1.9 },
		{ zoom: 0.8, size: 1.5 },
		{ zoom: 1.0, size: 0.9 },
		{ zoom: 1.2, size: 0.65 },
		{ zoom: 1.4, size: 0.4 },
		{ zoom: 1.6, size: 0.38 },
		{ zoom: 1.8, size: 0.29 },
		{ zoom: 2.0, size: 0.3 },
		{ zoom: 2.2, size: 0.18 },
		{ zoom: 2.4, size: 0.16 },
		{ zoom: 2.6, size: 0.12 },
		{ zoom: 2.8, size: 0.1 },
		{ zoom: 3.0, size: 0.1 },
	];

	// Helper to get interpolated font size for current zoom
	function getLabelFontSize(currentZoom) {
		if (currentZoom <= labelFontSizes[0].zoom) return labelFontSizes[0].size;
		if (currentZoom >= labelFontSizes[labelFontSizes.length - 1].zoom) return labelFontSizes[labelFontSizes.length - 1].size;
		for (let i = 0; i < labelFontSizes.length - 1; i++) {
			const z0 = labelFontSizes[i].zoom, z1 = labelFontSizes[i + 1].zoom;
			const s0 = labelFontSizes[i].size, s1 = labelFontSizes[i + 1].size;
			if (currentZoom >= z0 && currentZoom <= z1) {
				const t = (currentZoom - z0) / (z1 - z0);
				return s0 + (s1 - s0) * t;
			}
		}
		return 1.2;
	}

	// Helper to get the current "zoomed" distance in km (Pluto's distance at zoom=1)
	function getCurrentZoomKm() {
		// At zoom=1, maxRadius = 1000px = Pluto's distance (5900 million km)
		// At zoom=x, maxRadius * zoom = visible px, so visible distance = (maxDistance / maxRadius) * (maxRadius / zoom) = maxDistance / zoom
		// But since the solar system is scaled, we want to show the "distance" that fits in the current view.
		// We'll show the distance from the sun to the edge (Pluto's orbit) divided by zoom.
		const visibleDistance = maxDistance / zoom; // in millions of km
		return visibleDistance * 1_000_000; // in km
	}

	// Helper to get the closest planet (or Sun) for the current zoom level
	function getClosestPlanetAndDistance() {
		// Include Sun for zoom level 1
		const zoomLevels = planets.length; // 11 (Sun + 10 planets)
		// Map zoom to discrete levels: 1 (Sun) to 11 (Pluto)
		const t = (zoom - minZoom) / (maxZoom - minZoom);
		const idx = Math.round((1 - t) * (zoomLevels - 1));
		const planet = planets[Math.max(0, Math.min(idx, planets.length - 1))];
		return {
			name: planet.name,
			distance: planet.distanceFromSun * 1_000_000
		};
	}

	// Helper to get the current zoom level index (0=Sun, 1=Mercury, ..., 10=Pluto)
	function getZoomLevelIndex() {
		const zoomLevels = planets.length; // 11
		const t = (zoom - minZoom) / (maxZoom - minZoom);
		const idx = Math.round((1 - t) * (zoomLevels - 1));
		return Math.max(0, Math.min(idx, zoomLevels - 1));
	}

	// Helper to get explorers to show for the current planet modal or zoom level
	function getActiveExplorers() {
		const idx = getZoomLevelIndex();
		const zoomLevel = idx;
		const planetName = selectedPlanet ? selectedPlanet.name : null;
		if (selectedPlanet) {
			// Only show explorers whose showOnPlanets includes the selected planet
			return spaceExplorers.filter(explorer =>
				explorer.showOnPlanets.includes(planetName)
			);
		} else {
			// Only show explorers whose showOnZoomLevels includes the current zoom level
			return spaceExplorers.filter(explorer =>
				explorer.showOnZoomLevels.includes(zoomLevel)
			);
		}
	}

	// Helper to get rotations for a path
	function getPathRotations(path) {
		function getAngle(p1, p2) {
			const dx = p2.x - p1.x;
			const dy = p2.y - p1.y;
			return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
		}
		return path.map((point, idx, arr) =>
			idx < arr.length - 1 ? getAngle(point, arr[idx + 1]) : getAngle(point, arr[0])
		);
	}

	// Animate all active explorers (solar system view) at top-level
	useEffect(() => {
		if (!exploreMode || selectedPlanet) return;
		const activeExplorers = getActiveExplorers();
		const animState = {};
		const startTimestamps = {};

		// Reset animation state for new explorers or zoom changes
		activeExplorers.forEach(explorer => {
			const name = explorer.name;
			if (explorerLocalProgress.current[name] === undefined) {
				explorerLocalProgress.current[name] = 0;
			}
		});

		function animateAll(timestamp) {
			activeExplorers.forEach(explorer => {
				const name = explorer.name;
				const isPaused =
					hoveredPlanet === name ||
					showExplorerInfo === spaceExplorers.findIndex(e => e.name === name) ||
					selectedPlanet;

				const duration = 15000;

				if (isPaused) {
					if (explorerPausedProgress.current[name] !== undefined) {
						explorerLocalProgress.current[name] = explorerPausedProgress.current[name];
					} else {
						if (!startTimestamps[name]) {
							startTimestamps[name] = timestamp - (explorerLocalProgress.current[name] || 0) * duration;
						}
						const elapsed = (timestamp - startTimestamps[name]) % duration;
						const prog = elapsed / duration;
						explorerLocalProgress.current[name] = prog;
						explorerPausedProgress.current[name] = prog;
					}
					return;
				} else {
					if (explorerPausedProgress.current[name] !== undefined) {
						if (!startTimestamps[name]) {
							startTimestamps[name] = timestamp - explorerPausedProgress.current[name] * duration;
						} else {
							startTimestamps[name] = timestamp - explorerPausedProgress.current[name] * duration;
						}
						delete explorerPausedProgress.current[name];
					}
					if (!startTimestamps[name]) {
						startTimestamps[name] = timestamp - (explorerLocalProgress.current[name] || 0) * duration;
					}
					const elapsed = (timestamp - startTimestamps[name]) % duration;
					const prog = elapsed / duration;
					explorerLocalProgress.current[name] = prog;
				}
			});
			setExplorerDummy(v => v + 1);
			explorerAnimReq.current.global = requestAnimationFrame(animateAll);
		}

		explorerAnimReq.current.global = requestAnimationFrame(animateAll);

		return () => {
			if (explorerAnimReq.current.global) {
				cancelAnimationFrame(explorerAnimReq.current.global);
			}
		};
	// eslint-disable-next-line
	}, [exploreMode, selectedPlanet, hoveredPlanet, showExplorerInfo, explorerProgress, zoom]);

	// Close only the topmost modal on Escape key
	useEffect(() => {
		function handleEsc(e) {
			if (e.key === 'Escape') {
				if (showExplorerInfo !== null) {
					setShowExplorerInfo(null);
				} else if (selectedPlanet) {
					setSelectedPlanet(null);
					setSelectedPlanetIdx(null);
				}
			}
		}
		document.addEventListener('keydown', handleEsc);
		return () => document.removeEventListener('keydown', handleEsc);
	}, [selectedPlanet, showExplorerInfo]);

	// Helper to open a planet modal by index (filtered, no Sun)
	const filteredPlanets = planets.filter(p => p.name !== 'Sun');
	const openPlanetModal = (idx) => {
		setSelectedPlanet(filteredPlanets[idx]);
		setSelectedPlanetIdx(idx);
	};

	// Navigation handlers (filtered)
	const handlePrevPlanet = () => {
		if (selectedPlanetIdx === null) return;
		const prevIdx = (selectedPlanetIdx - 1 + filteredPlanets.length) % filteredPlanets.length;
		openPlanetModal(prevIdx);
	};
	const handleNextPlanet = () => {
		if (selectedPlanetIdx === null) return;
		const nextIdx = (selectedPlanetIdx + 1) % filteredPlanets.length;
		openPlanetModal(nextIdx);
	};

	return (
		<div
			className="min-h-screen bg-black p-6 flex flex-col items-center justify-center relative overflow-hidden"
			onMouseMove={handleMouseMove}
			onWheel={exploreMode ? handleWheelZoom : undefined}
		>
			<div className="absolute inset-0 z-0" style={{ pointerEvents: 'none', zIndex: 0 }}>
				{stars.map((star, index) => (
					<motion.div
						key={index}
						style={{
							position: "absolute",
							top: `${star.top + (mouse.y - 0.5) * 10}%`,
							left: `${star.left + (mouse.x - 0.5) * 10}%`,
							width: `${star.size}px`,
							height: `${star.size}px`,
							backgroundColor: star.color,
							borderRadius: "50%",
						}}
						animate={{
							opacity: [star.opacity, 0.2, star.opacity],
						}}
						transition={{
							repeat: Infinity,
							duration: star.duration,
							delay: star.delay,
							ease: "easeInOut",
						}}
					></motion.div>
				))}
				{sparkles.map((sparkle) => (
					<motion.div
						key={sparkle.id}
						style={{
							position: "absolute",
							top: `${sparkle.top}%`,
							left: `${sparkle.left}%`,
							width: `20px`,
							height: `20px`,
							borderRadius: "50%",
							background: "radial-gradient(white, transparent)",
						}}
						initial={{ opacity: 1, scale: 0 }}
						animate={{ opacity: 0, scale: 2 }}
						transition={{ duration: 1, ease: "easeOut" }}
						onAnimationComplete={() => {
							setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
						}}
					></motion.div>
				))}
			</div>
			{/* Shooting stars in their own container above background, below planets and modals */}
			<div style={{ position: 'absolute', inset: 0, zIndex: 100, /* was 25 */ pointerEvents: 'none' }}>
				{shootingStars.map((star, idx) => {
					const angleRad = (star.angle-340) * (Math.PI / 180);
					const distance = 400;
					const deltaX = Math.cos(angleRad) * distance;
					const deltaY = Math.sin(angleRad) * distance;
					return (
						<motion.div
							key={star.id}
							initial={{ opacity: 1, x: 0, y: 0 }}
							animate={{ opacity: 0, x: deltaX, y: deltaY }}
							transition={{ duration: 4 * star.speed, ease: "easeOut" }}
							onAnimationComplete={() => {
								setShootingStars((prev) =>
									prev.filter((s) => s.id !== star.id)
								);
							}}
							style={{
								position: "absolute",
								top: `${star.top}%`,
								left: `${star.left}%`,
								zIndex: 100, // was 25
								pointerEvents: "none", // container disables pointer events
							}}
						>
							{/* Make the clickable star head pointerEvents: auto and higher zIndex */}
							<div
								style={{
									position: "absolute",
									width: "60px",
									height: "60px",
									top: "-20px",
									left: "-20px",
									cursor: "pointer",
									zIndex: 101, // ensure above trail
									pointerEvents: "auto",
									transform: `rotate(${star.angle}deg)`,
									transformOrigin: "0 0",
								}}
								onClick={e => handleShootingStarClick(star, e)}
								onMouseEnter={() => setHoveredStar(star.id)}
								onMouseLeave={() => setHoveredStar(null)}
							>
								{hoveredStar === star.id && (
									<div
										style={{
											position: "absolute",
											top: "20px",
											left: "20px",
											transform: "translate(-50%, -50%)",
											width: "70px",
											height: "70px",
											borderRadius: "50%",
											border: "3px solid #ffe680",
											boxShadow: "0 0 16px 4px #ffe68088",
											pointerEvents: "none",
											zIndex: 102,
										}}
									></div>
								)}
							</div>
							{/* Trail is not clickable */}
							<div
								style={{
									width: "1px",
									height: "80px",
									background: "linear-gradient(white, transparent)",
									borderRadius: "1px",
									transform: `rotate(${star.angle-240}deg)`,
									transformOrigin: "0 0",
									pointerEvents: "none",
									zIndex: 100,
								}}
							></div>
						</motion.div>
					);
				})}
			</div>
			

			{exploreMode && !selectedPlanet && (
				<>
					<div
						className="fixed left-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto p-4"
						style={{
							zIndex: 10000, // ensure zoom buttons are on top of everything
						}}
					>
						<Button
							disabled={zoom >= maxZoom}
							onClick={() => {
								// Move zoom up by one step
								const idx = Math.round((zoom - minZoom) / zoomStep);
								const nextIdx = Math.min(idx + 1, zoomLevels - 1);
								setZoom(minZoom + nextIdx * zoomStep);
							}}
							className="text-black font-bold rounded-full shadow-lg flex items-center justify-center group"
							style={{
								background: zoom >= maxZoom
									? 'linear-gradient(90deg, #22223b 0%, #22223b 100%)'
									: 'linear-gradient(90deg, rgb(34, 34, 59) 0%, rgb(74, 78, 105) 100%)',
								color: 'white',
								fontSize: '2rem',
								fontWeight: 600,
								width: '2.5rem',
								height: '2.5rem',
								lineHeight: 1,
								padding: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								border: 'none',
								boxShadow: '0 0 12px 2px #3a3aff55',
								cursor: zoom >= maxZoom ? 'not-allowed' : 'pointer',
								position: 'relative',
								overflow: 'visible',
								opacity: zoom >= maxZoom ? 0.5 : 1,
							}}
						>
							<span style={{ display: 'block', width: '100%', textAlign: 'center', zIndex: 2, position: 'relative' }}>+</span>
							{zoom < maxZoom && (
								<span
									className="zoom-ring"
									style={{
										position: 'absolute',
										top: '50%',
										left: '50%',
										transform: 'translate(-50%, -50%)',
										width: '100%',
										height: '100%',
										borderRadius: '50%',
										border: '3px solid #ffe680',
										opacity: 0,
										transition: 'opacity 0.2s',
										pointerEvents: 'none',
									}}
								/>
							)}
						</Button>
						<Button
							disabled={zoom <= minZoom}
							onClick={() => {
								// Move zoom down by one step
								const idx = Math.round((zoom - minZoom) / zoomStep);
								const nextIdx = Math.max(idx - 1, 0);
								setZoom(minZoom + nextIdx * zoomStep);
							}}
							className="text-black font-bold rounded-full shadow-lg flex items-center justify-center group"
							style={{
								background: zoom <= minZoom
									? 'linear-gradient(90deg, #22223b 0%, #22223b 100%)'
									: 'linear-gradient(90deg, rgb(34, 34, 59) 0%, rgb(74, 78, 105) 100%)',
								color: 'white',
								fontSize: '2rem',
								fontWeight: 600,
								width: '2.5rem',
								height: '2.5rem',
								lineHeight: 1,
								padding: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								border: 'none',
								boxShadow: '0 0 12px 2px #3a3aff55',
								cursor: zoom <= minZoom ? 'not-allowed' : 'pointer',
								position: 'relative',
								overflow: 'visible',
								opacity: zoom <= minZoom ? 0.5 : 1,
							}}
						>
							<span style={{ display: 'block', width: '100%', textAlign: 'center', zIndex: 2, position: 'relative' }}>-</span>
							{zoom > minZoom && (
								<span
									className="zoom-ring"
									style={{
										position: 'absolute',
										top: '50%',
										left: '50%',
										transform: 'translate(-50%, -50%)',
										width: '100%',
										height: '100%',
										borderRadius: '50%',
										border: '3px solid #ffe680',
										opacity: 0,
										transition: 'opacity 0.2s',
										pointerEvents: 'none',
									}}
								/>
							)}
						</Button>
						<style>{`
							.group:hover .zoom-ring {
								opacity: 1 !important;
							}
						`}</style>
					</div>
					<div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
						<div
							id="solar-system-container"
							className="relative w-[2200px] h-[2200px] max-w-full max-h-full flex items-center justify-center"
							style={{
								// Adjust scale so the whole solar system fits when zoomed out
								transform: `scale(${zoom * (1 - 0.95 * (1 - zoom))})`,
								transition: 'transform 0.3s',
								pointerEvents: 'auto',
							}}
						>
							<img
								src="images/sun.png"
								alt="Sun"
								className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl animate-pulse absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
								style={{ pointerEvents: 'auto', cursor: 'pointer' }}
								onClick={() => {
									playClickSound();
									setSelectedPlanet({
										name: 'Sun',
										img: 'images/sun.png',
										type: 'G-type main-sequence star (G2V)',
										age: '4.6 billion years',
										lifetime: 'Approx. 10 billion years',
										size: '1,391,000 km diameter',
										mass: '1.989 × 10^30 kg',
										temperature: 'Surface: 5,505°C (9,941°F); Core: ~15,000,000°C',
										description: 'The Sun is the star at the center of our solar system. It is a nearly perfect sphere of hot plasma, providing the energy that sustains life on Earth.'
									});
								}}
							/>
							{/* Planets orbiting */}
							{planets.filter(p => p.name !== 'Sun').map((planet, i) => {
								const distanceRatio = planetDistances[planet.name] / maxDistance;
								const sunSize = 160; // px, matches w-40 h-40 (10rem) for Sun
								const planetSize = (planet.scale / 100) * sunSize;
								const minGap = sunSize / 2 + 24;
								const minOrbit = minGap / (planetDistances['Mercury'] / maxDistance);
								// Interpolate between minOrbit (zoomed in) and maxRadius (zoomed out)
								const orbitRadius =
									zoom < 1
										? minOrbit * distanceRatio * zoom + maxRadius * distanceRatio * (1 - zoom)
										: minOrbit * distanceRatio;
								const duration = planet.speed;
								const adjustedOrbitRadius = orbitRadius + planetSize / 2;

								// Calculate the current angle for the label (0deg = 3 o'clock, increases clockwise)
								const now = Date.now();
								const orbitProgress = ((now / 1000) % duration) / duration; // 0..1
								const labelAngle = (-(orbitProgress * 360) % 360) - planet.labelRotation;
								console.log(`${planet.name} orbitRadius: ${orbitRadius}, duration: ${duration}, adjustedOrbitRadius: ${adjustedOrbitRadius}, angle: ${labelAngle.toFixed(2)}°`);

								return (
									<div
										key={planet.name}
										className="absolute left-1/2 top-1/2"
										style={{ width: 0, height: 0, zIndex: 10 }}
									>
										{/* Orbit ring always visible, centered on planet */}
										<div
											className="absolute left-1/2 top-1/2 rounded-full"
											style={{
												width: adjustedOrbitRadius * 2 + 'px',
												height: adjustedOrbitRadius * 2 + 'px',
												marginLeft: -adjustedOrbitRadius + 'px',
												marginTop: -adjustedOrbitRadius + 'px',
												border: `2px solid ${planet.color}`,
												boxShadow: `0 0 16px 4px ${planet.color}88`,
												pointerEvents: 'none',
											}}
										></div>
										{/* Animated planet */}
										<div
											className="absolute left-1/2 top-1/2"
											style={{
												width: 0,
												height: 0,
												transform: `rotate(0deg) translate(${orbitRadius}px, 0)`,
												transformOrigin: `0 0`,
												animation: `orbit${i} ${duration}s linear infinite`,
											}}
											onMouseEnter={() => {
												console.log(`Planet "${planet.name}" orbit animation: orbit${i}, duration: ${duration}s, orbitRadius: ${orbitRadius}`);
											}}
										>
											<div style={{ position: "relative", width: planetSize, height: planetSize }}>
												<img
													src={planet.img}
													alt={planet.name}
													style={{
														width: planetSize + 'px',
														height: planetSize + 'px',
														pointerEvents: 'auto',
														borderRadius: '9999px',
														background: '#000',
														transition: 'box-shadow 0.2s, border-color 0.2s, cursor 0.2s',
														border: '2px solid transparent',
														boxShadow: '0 2px 8px 0 transparent',
														cursor: 'default',
														display: 'block',
													}}
													onMouseEnter={e => {
														e.currentTarget.style.borderColor = '#fefcbf';
														e.currentTarget.style.boxShadow = '0 2px 8px 0 #0008';
														e.currentTarget.style.cursor = 'pointer';
														setHoveredPlanet(planet.name);
														console.log(`Planet "${planet.name}" orbit animation: orbit${i}, duration: ${duration}s, orbitRadius: ${orbitRadius}`);
													}}
													onMouseLeave={e => {
														e.currentTarget.style.borderColor = 'transparent';
														e.currentTarget.style.boxShadow = '0 2px 8px 0 transparent';
														e.currentTarget.style.cursor = 'default';
														setHoveredPlanet(null);
													}}
													onClick={() => {
														playClickSound();
														openPlanetModal(i);
													}}
												/>
												{hoveredPlanet === planet.name && (
													<span
														className="px-2 py-1 rounded bg-black bg-opacity-70 text-yellow-200 font-bold shadow"
														style={{
															position: 'absolute',
															left: '0',
															top: `100%`,
															transform: `translateX(-50%) rotate(${labelAngle}deg) scale(${getLabelFontSize(zoom)})`,
															fontSize: '2.1rem',
															marginTop: '0.25rem',
															whiteSpace: 'nowrap',
															userSelect: 'none',
															pointerEvents: 'none',
															zIndex: 1,
															animation: undefined,
															transformOrigin: '50% 0%',
														}}
													>
														{planet.name}
													</span>
												)}
											</div>
										</div>
										<style>{`
											@keyframes orbit${i} {
												100% { transform: rotate(360deg) translate(${orbitRadius}px, 0); }
											}
											@keyframes orbit-label${i} {
												0% { transform: translateX(-50%) rotate(0deg);}
												100% { transform: translateX(-50%) rotate(-360deg);}
											}
										`}</style>
									</div>
								);
							})}
						</div>
					</div>
				</>
			)}

			{/* Wish Meter styled like Zoom Meter */}
			<div
				style={{
					position: 'fixed',
					left: '2rem',
					top: '2rem',
					background: 'rgba(0,0,0,0.7)',
					color: '#ffe680',
					fontWeight: 'bold',
					fontSize: '1.5rem',
					padding: '0.75rem 1.5rem',
					borderRadius: '1rem',
					zIndex: 100,
					boxShadow: '0 2px 12px #000a',
					letterSpacing: '0.05em',
				}}
			>
				⭐ Wish Meter: {caughtStars}
			</div>

			{!exploreMode && (
				<StartExploringScreen
					onStart={() => {
						setExploreMode(true);
						startMusic();
					}}
				/>
			)}

			{selectedPlanet && selectedPlanet.name === 'Sun' && (
				<SunModal
					sun={selectedPlanet}
					onClose={() => setSelectedPlanet(null)}
					speak={speak}
				/>
			)}
			{selectedPlanet && selectedPlanet.name !== 'Sun' && (
				<PlanetModal
					planet={selectedPlanet}
					onClose={() => { setSelectedPlanet(null); setSelectedPlanetIdx(null); }}
					getActiveExplorers={getActiveExplorers}
					getPathRotations={getPathRotations}
					hoveredPlanet={hoveredPlanet}
					setHoveredPlanet={setHoveredPlanet}
					setShowExplorerInfo={setShowExplorerInfo}
					spaceExplorers={spaceExplorers}
					speak={speak}
					planets={filteredPlanets}
					planetIdx={selectedPlanetIdx}
					onPrevPlanet={handlePrevPlanet}
					onNextPlanet={handleNextPlanet}
				/>
			)}

			{/* Show zoom level at bottom right */}
			{exploreMode && (
				<div
					style={{
						position: 'fixed',
						right: '2rem',
						bottom: '2rem',
						background: 'rgba(0,0,0,0.7)',
						color: '#ffe680',
						fontWeight: 'bold',
						fontSize: '1.5rem',
						padding: '0.75rem 1.5rem',
						borderRadius: '1rem',
						zIndex: 100,
						boxShadow: '0 2px 12px #000a',
						letterSpacing: '0.05em',
					}}
				>
					Zoom: {getCurrentZoomKm().toLocaleString()} km from Sun
				</div>
			)}

			{/* Show explorer icons as animated ships for current zoom level (always render explorer modals on top) */}
			{exploreMode && (
				getActiveExplorers().map((explorer, i) => {
					const rotations = getPathRotations(explorer.path);
					const isHovered = hoveredPlanet === explorer.name;
					const explorerIdx = spaceExplorers.findIndex(e => e.name === explorer.name);
					const explorerModalOpen = showExplorerInfo === explorerIdx;

					return (
						<React.Fragment key={explorer.name}>
							{/* Hide explorer icon if its modal is open or if planet modal is open */}
							{!explorerModalOpen && !selectedPlanet && (
								<div
									style={{
										position: 'absolute',
										left: `calc(${2 + i * 6}vw + ${(() => {
											const path = explorer.path;
											const n = path.length;
											const progress = (explorerLocalProgress.current[explorer.name] || 0);
											const t = progress * (n - 1);
											const idx = Math.floor(t);
											const frac = t - idx;
											const nextIdx = (idx + 1) % n;
											return path[idx].x + (path[nextIdx].x - path[idx].x) * frac;
										})()}px)`,
										bottom: `calc(8vh + ${(() => {
											const path = explorer.path;
											const n = path.length;
											const progress = (explorerLocalProgress.current[explorer.name] || 0);
											const t = progress * (n - 1);
											const idx = Math.floor(t);
											const frac = t - idx;
											const nextIdx = (idx + 1) % n;
											return path[idx].y + (path[nextIdx].y - path[idx].y) * frac;
										})()}px)`,
										zIndex: 100,
										pointerEvents: 'auto',
									}}
								>
									<div style={{ position: 'relative', display: 'inline-block' }}>
										<motion.img
											src={explorer.img}
											alt={explorer.name}
											className="w-16 h-16"
											style={{
												cursor: 'pointer',
												border: isHovered ? '2px solid #fefcbf' : '2px solid transparent',
												boxShadow: isHovered ? '0 2px 8px 0 #0008' : '0 2px 8px 0 transparent',
												borderRadius: '50%',
												background: isHovered ? '#22223b' : 'transparent',
												transition: 'box-shadow 0.2s, border-color 0.2s, cursor 0.2s, transform 0.08s linear',
												transform: `rotate(${(() => {
													const rots = rotations;
													const path = explorer.path;
													const n = path.length;
													const progress = (explorerLocalProgress.current[explorer.name] || 0);
													const t = progress * (n - 1);
													const idx = Math.floor(t);
													const frac = t - idx;
													const nextIdx = (idx + 1) % n;
													return rots[idx] + (rots[nextIdx] - rots[idx]) * frac;
												})()}deg)`,
											}}
											animate={false}
											onClick={() => setShowExplorerInfo(explorerIdx)}
											onMouseEnter={() => {
												explorerPausedProgress.current[explorer.name] = explorerLocalProgress.current[explorer.name] || 0;
												setHoveredPlanet(explorer.name);
											}}
											onMouseLeave={() => {
												setHoveredPlanet(null);
											}}
										/>
										{isHovered && (
											<div
												style={{
													position: 'absolute',
													left: '50%',
													top: '100%',
													transform: 'translateX(-50%)',
													marginTop: '0.5rem',
													background: 'rgba(0,0,0,0.85)',
													color: '#ffe680',
													fontWeight: 600,
													fontSize: '1.1rem',
													padding: '0.35rem 1.1rem',
													borderRadius: '0.75rem',
													boxShadow: '0 2px 8px #000a',
													whiteSpace: 'nowrap',
													textAlign: 'center',
													userSelect: 'none',
													pointerEvents: 'none',
												}}
											>
												{explorer.name}
											</div>
										)}
									</div>
								</div>
							)}
							{/* Explorer modal, always on top, even if planet modal is open */}
							{explorerModalOpen && (
								<ExplorerModal
									explorer={explorer}
									onClose={() => {
										setShowExplorerInfo(null);
										setHoveredPlanet(null); // Reset hover state
										// Remove paused progress so animation resumes
										if (explorerPausedProgress.current[explorer.name] !== undefined) {
											delete explorerPausedProgress.current[explorer.name];
										}
									}}
									speak={speak}
								/>
							)}
						</React.Fragment>
					);
				})
			)}
		</div>
	);
}