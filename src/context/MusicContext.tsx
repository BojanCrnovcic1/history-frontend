import { createContext, useContext, useEffect, useRef, useState } from "react";

interface MusicContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
  startMusicOnInteraction: () => void;
  setTrack: (src: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio("/assets/audio/history-historical-documentary-music-334820.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    const audio = audioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(err => console.log("Autoplay blocked:", err));
    } else {
      audioRef.current.pause();
    }
  };

  const setTrack = (src: string) => {
    if (!audioRef.current) return;

    const wasPlaying = !audioRef.current.paused;
    audioRef.current.pause();
    audioRef.current.src = src;
    audioRef.current.load();

    if (wasPlaying) {
      audioRef.current.play().catch(err => console.log("Play error:", err));
    }
  };

  // pokreni muziku čim user napravi prvu interakciju (klik, skrol…)
  const startMusicOnInteraction = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    const enableOnInteraction = () => startMusicOnInteraction();
    window.addEventListener("click", enableOnInteraction, { once: true });
    window.addEventListener("scroll", enableOnInteraction, { once: true });

    return () => {
      window.removeEventListener("click", enableOnInteraction);
      window.removeEventListener("scroll", enableOnInteraction);
    };
  }, []);

  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic, startMusicOnInteraction, setTrack }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside MusicProvider");
  return ctx;
};
