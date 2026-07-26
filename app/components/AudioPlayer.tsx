'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  label?: string;
  className?: string;
}

export default function AudioPlayer({ audioUrl, duration, label = 'Nota de Voz', className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => console.error('Audio play error:', err));
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs font-semibold shadow-sm backdrop-blur-sm ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-7 h-7 rounded-full bg-[#006156] text-white flex items-center justify-center hover:bg-[#004d44] transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
        title={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-[0.5px]" />}
      </button>

      {/* Title & Duration */}
      <div className="flex flex-col min-w-[90px]">
        <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-[#006156]">
          <span>{label}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {formatTime(currentTime)} / {formatTime(totalDuration || 0)}
          </span>
        </div>

        {/* Dynamic progress bar */}
        <div className="w-full bg-emerald-200/60 rounded-full h-1 mt-1 overflow-hidden">
          <div
            className="bg-[#006156] h-full transition-all duration-150"
            style={{ width: `${totalDuration ? (currentTime / totalDuration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Mute button */}
      <button
        type="button"
        onClick={toggleMute}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
