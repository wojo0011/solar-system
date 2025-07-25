import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import NarratorAstronaut from "./NarratorAstronaut";
import "./ExplorerModal.css";

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
		<div
			className="explorer-modal-overlay"
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
				className="explorer-modal"
				onClick={e => e.stopPropagation()}
			>
				<Button
					className="close-btn"
					onClick={onClose}
					aria-label="Close"
				>
					<span className="close-x">×</span>
				</Button>
				{/* Left: Image */}
				<div className="explorer-modal-left">
					<h2 className="explorer-modal-title">
						{explorer.name}
					</h2>
					<img
						className="explorer-modal-img"
						src={explorer.img}
						alt={explorer.name}
					/>
					{explorer.yearsOfService && (
						<p className="explorer-modal-years">
							Years of Service: {explorer.yearsOfService}
						</p>
					)}
				</div>
				{/* Right: Description and Read Aloud */}
				<div className="explorer-modal-right">
					<p className="explorer-modal-desc">
						{explorer.description}
					</p>
					<div className="explorer-modal-read-btns">
						<Button
							className={'read-aloud-button' + (isReading ? ' reading' : '')}
							onClick={() => handleSpeak(explorer.description)}
						>
							{isReading ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
