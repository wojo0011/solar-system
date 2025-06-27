import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import NarratorAstronaut from "./NarratorAstronaut";

// Props: explorer, onClose, speak
export default function ExplorerModal({ explorer, onClose, speak }) {
	const [isReading, setIsReading] = useState(false);
	const [voices, setVoices] = useState([]);

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
		setTimeout(() => {
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
				<NarratorAstronaut isVisible={isReading} />
				<div
					style={{
						background: '#18181b',
						borderRadius: '1.5rem',
						padding: '2rem 2.5rem',
						boxShadow: '0 8px 32px #000a',
						maxWidth: 900,
						width: '100%',
						textAlign: 'left',
						position: 'relative',
						display: 'flex',
						gap: '2rem',
						alignItems: 'stretch',
						minHeight: 0,
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
					{/* Left: Image */}
					<div style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'flex-start',
						minWidth: 400,
						maxWidth: 400,
						flex: '0 0 400px',
					}}>
						<h2 style={{
							color: '#ffe680',
							fontSize: '1.5rem',
							fontWeight: 700,
							margin: 0,
							marginBottom: '0.5rem',
							textAlign: 'center',
						}}>
							{explorer.name}
						</h2>
						<img
							src={explorer.img}
							alt={explorer.name}
							style={{
								width: '100%',
								maxWidth: '400px',
								height: 'auto',
								aspectRatio: '1/1',
								objectFit: 'contain',
								borderRadius: '1rem',
								marginBottom: '1rem',
								background: '#22223b',
								boxShadow: '0 2px 12px #0006',
							}}
						/>
						{explorer.yearsOfService && (
							<p style={{
								color: '#a5b4fc',
								fontSize: '1.1rem',
								marginBottom: 0,
								fontWeight: 600,
								textAlign: 'center',
							}}>
								Years of Service: {explorer.yearsOfService}
							</p>
						)}
					</div>
					{/* Right: Description and Read Aloud */}
					<div style={{
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'flex-start',
						minWidth: 0,
					}}>
						<p style={{
							color: '#fff',
							fontSize: '1.1rem',
							marginBottom: '1.5rem',
							lineHeight: 1.6,
							wordBreak: 'break-word',
						}}>
							{explorer.description}
						</p>
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
								onClick={() => handleSpeak(explorer.description)}
							>
								{isReading ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
