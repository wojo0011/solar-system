import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

import NarratorAstronaut from "./NarratorAstronaut";

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
}) {
	const [isReading, setIsReading] = useState(false);
	const [voices, setVoices] = useState([]);
	const [tab, setTab] = useState('info'); // 'info' or 'surface'

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

	return (
		<>
			<NarratorAstronaut isVisible={isReading}/>
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100vw',
					height: '100vh',
					background: 'rgba(0,0,0,0.7)',
					zIndex: 9999,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
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
				<div
					style={{
						background: '#18181b',
						borderRadius: '1.5rem',
						padding: '2.5rem 2.5rem',
						boxShadow: '0 8px 32px #000a',
						maxWidth: 700,
						minWidth: 520,
						minHeight: 520,
						textAlign: 'left',
						position: 'relative',
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: '2.5rem',
					}}
					onClick={e => e.stopPropagation()}
				>
					{/* Close button in top right */}
					<Button
						onClick={onClose}
						style={{
							position: 'absolute',
							top: '1.2rem',
							right: '1.2rem',
							width: '2.5rem',
							height: '2.5rem',
							borderRadius: '50%',
							background: 'linear-gradient(90deg, #22223b 0%, #4a4e69 100%)',
							color: 'white',
							fontWeight: 700,
							fontSize: '1.5rem',
							border: 'none',
							boxShadow: '0 0 12px 2px #4a4e6955',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 10001,
							padding: 0,
						}}
						aria-label="Close"
					>
						&#10005;
					</Button>
					{/* Tabs: absolutely positioned just above top-left of modal, touching it */}
					<div
						style={{
							position: 'absolute',
							top: '-3.2rem', // overlap modal by 0.2rem (tab height ~2rem + padding)
							left: '2.5rem', // align with modal padding
							display: 'flex',
							gap: '0.5rem',
							background: '#18181b',
							borderTopLeftRadius: '1.5rem',
							borderTopRightRadius: '1.5rem',
							boxShadow: '0 4px 16px 0 #0004',
							padding: '0.15rem 0.4rem 0 0.4rem',
							zIndex: 10002,
						}}
					>
						<button
							style={{
								background: tab === 'info' ? 'linear-gradient(90deg, #ffe680 0%, #ffa751 100%)' : 'transparent',
								color: tab === 'info' ? '#22223b' : '#ffe680',
								fontWeight: 700,
								fontSize: '1.1rem',
								borderRadius: '1.5rem 1.5rem 0 0',
								border: 'none',
								padding: '0.7rem 2.2rem',
								cursor: 'pointer',
								boxShadow: tab === 'info' ? '0 0 8px 2px #ffe68055' : 'none',
								outline: tab === 'info' ? '2px solid #ffe680' : 'none',
								transition: 'background 0.2s, color 0.2s',
								borderBottom: tab === 'info' ? '4px solid #ffa751' : '4px solid transparent',
								marginBottom: '2px',
							}}
							onClick={() => setTab('info')}
							aria-label="Planet Info Tab"
						>
							🪐 Info
						</button>
						<button
							style={{
								background: tab === 'surface' ? 'linear-gradient(90deg, #7f00ff 0%, #3a3aff 100%)' : 'transparent',
								color: tab === 'surface' ? '#fff' : '#7f00ff',
								fontWeight: 700,
								fontSize: '1.1rem',
								borderRadius: '1.5rem 1.5rem 0 0',
								border: 'none',
								padding: '0.7rem 2.2rem',
								cursor: 'pointer',
								boxShadow: tab === 'surface' ? '0 0 8px 2px #7f00ff55' : 'none',
								outline: tab === 'surface' ? '2px solid #7f00ff' : 'none',
								transition: 'background 0.2s, color 0.2s',
								borderBottom: tab === 'surface' ? '4px solid #3a3aff' : '4px solid transparent',
								marginBottom: '2px',
							}}
							onClick={() => setTab('surface')}
							aria-label="Surface View Tab"
						>
							🏜️ Surface
						</button>
					</div>
					{/* Left: Name, Content below */}
					<div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: 420 }}>
						<h2 style={{ color: '#ffe680', fontSize: '2.1rem', fontWeight: 700, marginBottom: '0.8rem', textAlign: 'center' }}>
							{planet.name}
						</h2>
						{/* Tab content, fixed min height to avoid modal resize */}
						<div style={{ minHeight: 340, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
							{tab === 'info' ? (
								<>
									<img
										src={planet.img}
										alt={planet.name}
										style={{
											width: '220px',
											height: '220px',
											objectFit: 'contain',
											display: 'block',
											marginBottom: '0.8rem',
										}}
									/>
									<p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
										{planet.description}
									</p>
								</>
							) : (
								<>
									<img
										src={planet.surfaceImg}
										alt={planet.name + ' surface'}
										style={{
											width: '320px',
											height: '320px',
											objectFit: 'contain',
											display: 'block',
											marginBottom: '0.8rem',
											borderRadius: '1rem',
											background: '#23223b',
											border: '3px solid #7f00ff',
											boxShadow: '0 0 16px 4px #7f00ff55',
											padding: '0.5rem',
										}}
									/>
									<p style={{ color: '#7f00ff', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
										{planet.name} surface view
									</p>
								</>
							)}
						</div>
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
						
						
						{tab === 'info' ? (
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
										style={{
											background: isReading
												? 'linear-gradient(90deg, #7f00ff 0%, #3a3aff 100%)'
												: 'linear-gradient(90deg, #3a3aff 0%, #7f00ff 100%)',
											color: 'white',
											fontWeight: 600,
											fontSize: '1.1rem',
											padding: '0.75rem 1.5rem',
											borderRadius: '9999px',
											cursor: 'pointer',
											border: 'none',
											boxShadow: '0 0 12px 2px #3a3aff55',
											opacity: 1,
											transition: 'background 0.2s, opacity 0.2s',
										}}
										onClick={() => handleSpeak(planet.description)}
									>
										{isReading ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
									</Button>
								</div>
							</>
						) : (
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
										style={{
											background: isReading
												? 'linear-gradient(90deg, #7f00ff 0%, #3a3aff 100%)'
												: 'linear-gradient(90deg, #3a3aff 0%, #7f00ff 100%)',
											color: 'white',
											fontWeight: 600,
											fontSize: '1.1rem',
											padding: '0.75rem 1.5rem',
											borderRadius: '9999px',
											cursor: 'pointer',
											border: 'none',
											boxShadow: '0 0 12px 2px #3a3aff55',
											opacity: 1,
											transition: 'background 0.2s, opacity 0.2s',
										}}
										onClick={() => handleSpeak(planet.surfaceDetails)}
									>
										{isReading ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
									</Button>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
