import { useState, useCallback } from 'react';
import { whisperService } from '../services/whisper';

interface UseSpeechRecognitionReturn {
  text: string;
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<string>;
  error: string | null;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [text, setText] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setText('');
      setIsListening(true);
      await whisperService.startRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('음성 인식을 시작할 수 없습니다.');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      setIsListening(false);
      const audioBlob = await whisperService.stopRecording();
      const result = await whisperService.transcribe(audioBlob);
      
      if (result.text) {
        setText(result.text);
        return result.text;
      } else {
        setError('음성 인식에 실패했습니다.');
        return '';
      }
    } catch (err) {
      console.error('Speech recognition error:', err);
      setError('음성 인식 중 오류가 발생했습니다.');
      setText('');
      return '';
    }
  }, []);

  return {
    text,
    isListening,
    startListening,
    stopListening,
    error
  };
};
