import { useState, useCallback, useRef } from 'react';
import { createThread, addMessage, runAssistant, getResponse } from '../services/assistant';
import { textToSpeech, playAudio } from '../services/elevenlabs';

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

  const stopCurrentAudio = () => {
    if (audioSourceRef.current && isPlayingRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
      isPlayingRef.current = false;
      setIsAiSpeaking(false);
    }
  };

  const playAudioWithControl = async (audioData: ArrayBuffer): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isPlayingRef.current) {
        console.log('이미 오디오가 재생중입니다.');
        return resolve();
      }

      stopCurrentAudio();

      try {
        const AudioContext = window.AudioContext;
        const audioContext = new AudioContext();
        
        audioContext.decodeAudioData(audioData).then(audioBuffer => {
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          
          audioSourceRef.current = source;
          isPlayingRef.current = true;
          setIsAiSpeaking(true);

          source.onended = () => {
            isPlayingRef.current = false;
            setIsAiSpeaking(false);
            audioSourceRef.current = null;
            audioContext.close();
            resolve();
          };

          source.start(0);
        }).catch(error => {
          console.error('오디오 디코딩 중 오류:', error);
          reject(error);
        });
      } catch (error) {
        console.error('오디오 재생 중 오류:', error);
        reject(error);
      }
    });
  };

  const initializeInterview = useCallback(async () => {
    if (initializationCompleteRef.current || isInitializing || threadId) {
      console.log('이미 초기화되었거나 진행 중입니다.', {
        isComplete: initializationCompleteRef.current,
        isInitializing,
        threadId
      });
      return null;
    }
    
    try {
      console.log('면접 초기화 시작');
      setIsInitializing(true);
      
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