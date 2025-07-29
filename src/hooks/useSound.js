import { useRef, useEffect, useCallback } from "react";

/**
 * useHoverSound - Attach to any element to play a sound on hover/focus.
 * @param {string} src - Path to the sound file (relative to public or absolute).
 * @param {number} [volume=0.3] - Volume (0.0 to 1.0)
 */
export default function useSound(src, volume = 0.3) {
  const audioRef = useRef(null);

  useEffect(() => {

    const source = process.env.PUBLIC_URL + src;

    const audio = new window.Audio(source);
    audio.preload = "auto";
    const onLoaded = () => {
      // Optionally log or handle loaded
      // console.log("Hover sound loaded!", src);
    };
    const onError = () => {
      // Optionally log or handle error
      // console.warn("Failed to load hover sound.", src);
    };
    audio.addEventListener("canplaythrough", onLoaded, { once: true });
    audio.addEventListener("error", onError, { once: true });
    audioRef.current = audio;
    return () => {
      audio.removeEventListener("canplaythrough", onLoaded);
      audio.removeEventListener("error", onError);
    };
  }, [src]);

  const play = useCallback(() => {
    console.log("Playing sound:", src);
    const audio = audioRef.current;
    if (!audio) return;
    console.log("Playing sound 2:", src);
    try {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch (e) {
      // Optionally log
    }
  }, [volume]);

  return {
    play,
    onMouseEnter: play,
    onFocus: play,
  };
}
