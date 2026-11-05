import { useState, useCallback, useRef, useEffect } from 'react';

export interface Recording {
  id: string;
  name: string;
  blob?: Blob;
  duration: number;
  timestamp: number;
}

function getRecordingsKey(): string {
  return 'oral-recordings-v1';
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>(() => {
    try {
      const raw = localStorage.getItem(getRecordingsKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((r: Recording) => ({ ...r, blob: undefined })) : [];
    } catch {
      return [];
    }
  });
  const [playbackRecordingId, setPlaybackRecordingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentBlobRef = useRef<Blob | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      currentBlobRef.current = null;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        currentBlobRef.current = blob;
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);

      // Create recording after a short delay to ensure blob is ready
      setTimeout(() => {
        const blob = currentBlobRef.current;
        if (blob) {
          const newRecording: Recording = {
            id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: `Enregistrement ${recordings.length + 1}`,
            blob,
            duration: recordingDuration,
            timestamp: Date.now(),
          };

          setRecordings(prev => {
            const updated = [...prev, newRecording];
            // Save without blob to localStorage
            const storable = updated.map(r => ({ ...r, blob: undefined }));
            try {
              localStorage.setItem(getRecordingsKey(), JSON.stringify(storable));
            } catch { /* ignore */ }
            return updated;
          });
        }
      }, 100);
    }
  }, [isRecording, recordingDuration, recordings.length]);

  const playRecording = useCallback((recording: Recording) => {
    if (!recording.blob) {
      alert('Cet enregistrement n\'est plus disponible. Les blobs audio ne sont pas persistés entre les sessions.');
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const url = URL.createObjectURL(recording.blob);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setPlaybackRecordingId(recording.id);
    audio.onended = () => {
      setPlaybackRecordingId(null);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setPlaybackRecordingId(null);
      URL.revokeObjectURL(url);
    };

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
      const storable = updated.map(r => ({ ...r, blob: undefined }));
      try {
        localStorage.setItem(getRecordingsKey(), JSON.stringify(storable));
      } catch { /* ignore */ }
      return updated;
    });
    if (playbackRecordingId === id) {
      stopPlayback();
    }
  }, [playbackRecordingId, stopPlayback]);

  const renameRecording = useCallback((id: string, name: string) => {
    setRecordings(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, name } : r);
      const storable = updated.map(r => ({ ...r, blob: undefined }));
      try {
        localStorage.setItem(getRecordingsKey(), JSON.stringify(storable));
      } catch { /* ignore */ }
      return updated;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    isRecording,
    recordingDuration,
    recordings,
    playbackRecordingId,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    deleteRecording,
    renameRecording,
    formatDuration,
  };
}
