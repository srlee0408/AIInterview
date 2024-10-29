import { useState, useCallback, useRef } from 'react';
import { createThread, addMessage, runAssistant, getResponse } from '../services/assistant';
import { textToSpeech, playAudio } from '../services/elevenlabs';

interface UseInterviewAssistantReturn {
  isAiSpeaking: boolean;
  error: string | null;
  initializeInterview: () => Promise<string>;
  sendAnswer: (answer: string) => Promise<{ text: string; isEnd: boolean }>;
  stopSpeaking: () => void;
}

export const useInterviewAssistant = (): UseInterviewAssistantReturn => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkInterviewEnd = useCallback((response: string): boolean => {
    return response.includes("면접이 종료되었습니다") || 
           response.includes("면접을 마치겠습니다") || 
           response.includes("수고하셨습니다.");
  }, []);

  const stopCurrentAudio = () => {
    if (audioSourceRef.current && isPlayingRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
      isPlayingRef.current = false;
      setIsAiSpeaking(false);
    }
  };

  const playAudioWithControl = async (audioData: ArrayBuffer): Promise<void> => {
    return new Promise((resolve) => {
      stopCurrentAudio();

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
          resolve();
        };

        source.start(0);
      });
    });
  };

  const initializeInterview = useCallback(async () => {
    try {
      const thread = await createThread();
      setThreadId(thread.id);
      
      // 초기 인사 메시지 전송
      const greeting = "테스트를 진행해보겠습니다. 질문 이후 하단의 '답변 시작'을 누른 후 답변 해주시면 됩니다. 답변이 완료되면 '답변 종료'를 누르시면 됩니다. 이제 '답변 시작'을 누른 후 '네 준비되었습니다' 라고 답변해주시고 '답변 종료'를 눌러주세요.";
      await addMessage(thread.id, greeting);
      
      // 음성 생성과 동시에 텍스트 반환
      const audioData = await textToSpeech(greeting);
      playAudioWithControl(audioData).catch(console.error); // 비동기로 실행
      
      return greeting;
    } catch (err) {
      console.error('Error initializing interview:', err);
      setError('면접 초기화에 실패했습니다.');
      throw err;
    }
  }, []);

  const sendAnswer = useCallback(async (answer: string) => {
    if (!threadId) {
      throw new Error('면접이 초기화되지 않았습니다.');
    }

    try {
      // 사용자 답변을 thread에 추가
      await addMessage(threadId, answer);
      
      // AI 응답 생성
      const run = await runAssistant(threadId);
      const response = await getResponse(threadId, run.id);
      
      // 음성 생성과 동시에 텍스트 반환
      const audioData = await textToSpeech(response);
      playAudioWithControl(audioData).catch(console.error); // 비동기로 실행
      
      // 면접 종료 여부 확인
      const isEnd = checkInterviewEnd(response);
      
      return { text: response, isEnd };
    } catch (err) {
      console.error('Error sending answer:', err);
      setError('메시지 전송에 실패했습니다.');
      throw err;
    }
  }, [threadId, checkInterviewEnd]);

  const stopSpeaking = useCallback(() => {
    stopCurrentAudio();
  }, []);

  return {
    isAiSpeaking,
    error,
    initializeInterview,
    sendAnswer,
    stopSpeaking,
  };
}; 