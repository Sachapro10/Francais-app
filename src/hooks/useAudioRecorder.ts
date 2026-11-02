import { useState, useRef, useCallback, useEffect } from 'react';

export interface Recording {
  id: string;
  blobUrl: string;
  timestamp: number;
  duration: number;
  name: string;
}

const STORAGE_KEY = 'oral-recordings-v1';

function loadRecordings(): Recording[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Recording[];
  } catch {
    return [];
  }
}

function saveRecordings(recordings: Recording[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recordings));
  } catch {
    // Continue even when storage fails
  }
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>(() => loadRecordings());
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
  const [playbackRecordingId, setPlaybackRecordingId] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  const generateId = () => `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(blob);
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

        const newRecording: Recording = {
          id: generateId(),
          blobUrl,
          timestamp: Date.now(),
          duration,
          name: `Enregistrement ${recordings.length + 1}`,
        };

        setRecordings(prev => {
          const updated = [newRecording, ...prev].slice(0, 50);
          saveRecordings(updated);
          return updated;
        });

        setCurrentRecordingId(newRecording.id);
        setIsRecording(false);
        setRecordingDuration(0);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      setIsRecording(true);

      // Update duration every second
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Impossible d\'accéder au microphone. Veuillez autoriser l\'accès au microphone.');
    }
  }, [recordings.length]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const playRecording = useCallback((rec: Recording) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(rec.blobUrl);
    audioRef.current = audio;
    setPlaybackRecordingId(rec.id);
    audio.onended = () => setPlaybackRecordingId(null);
    audio.play();
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaybackRecordingId(null);
  }, []);

  const deleteRecording = useCallback((id: string) => {
    setRecordings(prev => {
      const updated = prev.filter(r => r.id !== id);
      saveRecordings(updated);
      return updated;
    });
    if (currentRecordingId === id) setCurrentRecordingId(null);
    if (playbackRecordingId === id) stopPlayback();
  }, [currentRecordingId, playbackRecordingId, stopPlayback]);

  const renameRecording = useCallback((id: string, name: string) => {
    setRecordings(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, name } : r);
      saveRecordings(updated);
      return updated;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    recordings,
    currentRecordingId,
    playbackRecordingId,
    recordingDuration,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    deleteRecording,
    renameRecording,
    formatDuration,
  };
}
