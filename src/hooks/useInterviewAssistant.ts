import { useState, useCallback, useRef, useMemo } from 'react';
import { createThread, addMessage, runAssistant, getResponse } from '../services/assistant';
import { AudioManager } from '../services/AudioManager';
import { textToSpeech } from '../services/elevenlabs';

interface UseInterviewAssistantReturn {
  isAiSpeaking: boolean;
  error: string | null;
  initializeInterview: () => Promise<string | null>;
  sendAnswer: (answer: string) => Promise<{ text: string; isEnd: boolean }>;
  stopSpeaking: () => void;
  cleanup: () => void;
}

export const useInterviewAssistant = (): UseInterviewAssistantReturn => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const initializationCompleteRef = useRef<boolean>(false);
  const audioManager = useMemo(() => AudioManager.getInstance(), []);

  const stopCurrentAudio = useCallback(() => {
    if (audioSourceRef.current && isPlayingRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
      isPlayingRef.current = false;
      setIsAiSpeaking(false);
    }
  }, []);

  const playAudioWithControl = useCallback(async (audioData: ArrayBuffer): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isPlayingRef.current) {
        console.log('이미 오디오가 재생중입니다.');
        return resolve();
      }

      stopCurrentAudio();

      try {
        audioManager.playAudio(audioData)
          .then(source => {
            audioSourceRef.current = source;
            isPlayingRef.current = true;
            setIsAiSpeaking(true);

            source.onended = () => {
              isPlayingRef.current = false;
              setIsAiSpeaking(false);
              audioSourceRef.current = null;
              resolve();
            };
          })
          .catch(error => {
            console.error('오디오 재생 중 오류:', error);
            reject(error);
          });
      } catch (error) {
        console.error('오디오 처리 중 오류:', error);
        reject(error);
      }
    });
  }, [stopCurrentAudio]);

  const initializeInterview = useCallback(async () => {
    if (initializationCompleteRef.current || isInitializing || threadId) {
      console.log('이미 초기화되었거나 진행 중입니다.', {
        isComplete: initializationCompleteRef.current,
        isInitializing,
        threadId
      });
      return null;
    }

    setIsInitializing(true);
    
    try {
      console.log('면접 초기화 시작');
      
      if (initializationCompleteRef.current) {
        console.log('다른 프로세스에서 이미 초기화가 완료됨');
        setIsInitializing(false);
        return null;
      }
      
      const thread = await createThread();
      setThreadId(thread.id);
      
      await addMessage(thread.id, "면접을 시작해주세요.");
      console.log('초기 메시지 전송 완료');
      
      const run = await runAssistant(thread.id);
      const response = await getResponse(thread.id, run.id);
      
      try {
        console.log('AI 음성 변환 시작');
        const audioData = await textToSpeech(response);
        console.log('AI 음성 변환 완료, 재생 시작');
        await playAudioWithControl(audioData);
        console.log('AI 음성 재생 완료');
      } catch (err) {
        console.error('음성 처리 중 오류:', err);
      }
      
      initializationCompleteRef.current = true;
      setIsInitializing(false);
      console.log('면접 초기화 완료');
      
      return response;
    } catch (err) {
      console.error('면접 초기화 중 오류:', err);
      setError('면접 초기화에 실패했습니다.');
      setIsInitializing(false);
      setThreadId(null);
      initializationCompleteRef.current = false;
      return null;
    }
  }, []);

  const sendAnswer = useCallback(async (answer: string): Promise<{ text: string; isEnd: boolean }> => {
    if (!threadId) {
      throw new Error('면접이 초기화되지 않았습니다.');
    }

    try {
      await addMessage(threadId, answer);
      const run = await runAssistant(threadId);
      const response = await getResponse(threadId, run.id);
      
      const isEnd = response.includes('면접이 종료되었습니다') || 
                   response.includes('면접을 마치겠습니다') || 
                   response.includes('수고하셨습니다');

      try {
        const audioData = await textToSpeech(response);
        await playAudioWithControl(audioData);
      } catch (err) {
        console.error('음성 처리 중 오류:', err);
      }

      return {
        text: response,
        isEnd
      };
    } catch (err) {
      console.error('Error sending answer:', err);
      setError('답변 전송에 실패했습니다.');
      throw err;
    }
  }, [threadId]);

  const stopSpeaking = useCallback(() => {
    stopCurrentAudio();
    setIsAiSpeaking(false);
  }, []);

  const cleanup = useCallback(() => {
    stopCurrentAudio();
    setThreadId(null);
    setIsAiSpeaking(false);
    setIsInitializing(false);
    setError(null);
    initializationCompleteRef.current = false;
  }, []);

  return {
    isAiSpeaking,
    error,
    initializeInterview,
    sendAnswer,
    stopSpeaking,
    cleanup
  };
}; 