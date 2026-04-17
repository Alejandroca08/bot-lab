import { useState, useRef, useCallback } from "react";

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    startTimeRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    cleanup();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start(100);
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setDuration(0);

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 200);
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        cleanup();
        setIsRecording(false);
        reject(new Error("No active recording"));
        return;
      }

      const finalDuration = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm;codecs=opus",
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(",")[1];
          cleanup();
          setIsRecording(false);
          setDuration(0);
          resolve({ blob, base64, duration: finalDuration });
        };
        reader.onerror = () => {
          cleanup();
          setIsRecording(false);
          setDuration(0);
          reject(new Error("Failed to convert recording to base64"));
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.stop();
    });
  }, [cleanup]);

  return { isRecording, duration, startRecording, stopRecording };
}
