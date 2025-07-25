// src/utils/speechSynthesis.js
// Centralized speech synthesis utility for the solar system app

/**
 * Get available voices (async-safe)
 */
export function getVoices() {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
}

/**
 * Strip emoji/icons from text for speech
 */
export function stripIcons(text) {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u26FF\u2700-\u27BF]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get a preferred voice for a given language code, with fallback
 */
export function getPreferredVoice(voices, lang, fallbackLang, fallbackVoice) {
  let voice = voices.find(v => v.lang === lang);
  if (!voice && fallbackLang && fallbackLang !== lang) {
    voice = voices.find(v => v.lang === fallbackLang);
  }
  if (!voice && fallbackVoice) {
    voice = fallbackVoice;
  }
  return voice || voices[0] || null;
}

/**
 * Speak a message with the given language and voice, returns a cancel function
 */
export function speakMessage({
  text,
  lang,
  voices,
  fallbackLang,
  fallbackVoice,
  onEnd,
  onError,
  setUtteranceRef
}) {
  if (!window.speechSynthesis) return () => {};
  const utter = new window.SpeechSynthesisUtterance(stripIcons(text));
  utter.lang = lang;
  const voice = getPreferredVoice(voices, lang, fallbackLang, fallbackVoice);
  if (voice) utter.voice = voice;
  if (onEnd) utter.onend = onEnd;
  if (onError) utter.onerror = onError;
  if (setUtteranceRef) setUtteranceRef(utter);
  window.speechSynthesis.speak(utter);
  return () => {
    window.speechSynthesis.cancel();
  };
}

/**
 * Cancel all speech
 */
export function cancelSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}
