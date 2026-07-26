'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Upload, Volume2, CheckCircle2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioSaved: (audioUrl: string | null, durationSeconds?: number) => void;
  initialAudioUrl?: string | null;
}

export default function AudioRecorder({ onAudioSaved, initialAudioUrl = null }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setAudioUrl(base64Data);
          setAudioDuration(recordingTime);
          onAudioSaved(base64Data, recordingTime);
        };

        // Stop mic tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone error:', err);
      setErrorMsg('No se pudo acceder al micrófono. Puedes subir un archivo de audio si lo deseas.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleDeleteAudio = () => {
    setAudioUrl(null);
    setAudioDuration(0);
    setRecordingTime(0);
    onAudioSaved(null, 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setErrorMsg('Por favor selecciona un archivo de audio válido (.mp3, .wav, .m4a, .webm).');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setAudioUrl(base64Data);
      setAudioDuration(15); // Default duration estimation
      onAudioSaved(base64Data, 15);
    };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#006156] uppercase tracking-wider flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-[#39ADA3]" />
          Nota de Voz Opcional
        </label>
        {audioUrl && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Audio Grabado
          </span>
        )}
      </div>

      {errorMsg && (
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
          {errorMsg}
        </p>
      )}

      {/* When audio exists */}
      {audioUrl ? (
        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <audio src={audioUrl} controls className="h-8 max-w-[200px] sm:max-w-[240px]" />
          </div>
          <button
            type="button"
            onClick={handleDeleteAudio}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Eliminar nota de voz"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Recording / File Upload Controls */
        <div className="flex flex-wrap items-center gap-2.5">
          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm animate-pulse active:scale-95 transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Detener ({formatTime(recordingTime)})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-[#006156] hover:bg-[#004d44] text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Grabar Audio</span>
            </button>
          )}

          <span className="text-xs text-slate-400 font-semibold">o</span>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Subir Audio</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
