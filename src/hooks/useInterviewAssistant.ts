import { useState, useCallback, useRef } from 'react';
import { createThread, addMessage, runAssistant, getResponse } from '../services/assistant';
import { textToSpeech, playAudio } from '../services/elevenlabs';

interface UseInterviewAssistantReturn {
  isAiSpeaking: boolean;
  error: string | null;
  initializeInterview: () => Promise<string | null>;
  sendAnswer: (answer: string) => Promise<{ text: string; isEnd: boolean }>;
  stopSpeaking: () => void;
}

export const useInterviewAssistant = (): UseInterviewAssistantReturn => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      
      // 초기 안내 메시지
      const greeting = "테스트를 진행해보겠습니다. 질문 이후 하단의 '답변 시작'을 누른 후 답변 해주시면 됩니다. 답변이 완료되면 '답변 종료'를 누르시면 됩니다. 이제 '답변 시작'을 누른 후 '네 준비되었습니다' 라고 답변해주시고 '답변 종료'를 눌러주세요.";
      
      // 음성 변환 및 재생이 완료될 때까지 대기
      try {
        console.log('AI 말하기 시작');
        setIsAiSpeaking(true);
        const audioData = await textToSpeech(greeting);
        await playAudioWithControl(audioData);  // Promise가 완료될 때까지 대기
        console.log('AI 말하기 종료');
        setIsAiSpeaking(false);
      } catch (err) {
        console.error('음성 재생 중 오류:', err);
        setIsAiSpeaking(false);
      }
      
      return greeting;
    } catch (err) {
      console.error('Error initializing interview:', err);
      setError('면접 초기화에 실패했습니다.');
      return null;
    }
  }, []);

  const sendAnswer = useCallback(async (answer: string): Promise<{ text: string; isEnd: boolean }> => {
    if (!threadId) {
      throw new Error('면접이 초기화되지 않았습니다.');
    }

    try {
      //console.log('Sending answer to thread:', { threadId, answer });
      
      // 첫 답변("네 준비되었습니다")인 경우 면접 시작
      if (answer.includes("준비되었습니다")) {
        // 실제 면접 시작 메시지 전송
        await addMessage(threadId, "면접을 시작하겠습니다. 첫 번째 질문입니다.");
        const run = await runAssistant(threadId);
        const response = await getResponse(threadId, run.id);
        
        // 음성 변환 준비와 동시에 텍스트 반환
        const audioPromise = textToSpeech(response);
        
        // 먼저 텍스트 응답 반환
        const result = {
          text: response,
          isEnd: false
        };

        // 음성 재생은 백그라운드에서 처리
        audioPromise.then(audioData => {
          playAudioWithControl(audioData);
        }).catch(err => {
          console.error('음성 재생 중 오류:', err);
        });
        
        return result;
      }
      
      // 일반 답변 처리
      await addMessage(threadId, answer);
      const run = await runAssistant(threadId);
      const response = await getResponse(threadId, run.id);
      
      //console.log('Received response:', response);

      // 음성 변환 준비와 동시에 텍스트 반환
      setIsAiSpeaking(true);  // 음성 재생 시작
      const audioPromise = textToSpeech(response);
      
      const isEnd = response.includes('면접이 종료되었습니다') || 
                   response.includes('면접을 마치겠습니다') || 
                   response.includes('수고하셨습니다');

      // 먼저 텍스트 응답 반환
      const result = {
        text: response,
        isEnd
      };

      // 음성 재생은 백그라운드에서 처리
      audioPromise.then(audioData => {
        playAudioWithControl(audioData);
      }).catch(err => {
        console.error('음성 재생 중 오류:', err);
      });

      return result;

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

  return {
    isAiSpeaking,
    error,
    initializeInterview,
    sendAnswer,
    stopSpeaking
  };
}; 