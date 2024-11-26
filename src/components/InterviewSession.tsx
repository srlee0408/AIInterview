import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, memo } from 'react';
import { SpeechButton } from './SpeechButton';
import { TextDisplay } from './TextDisplay';
import { WebcamPreview } from './WebcamPreview';
import { useWebcamRecorder } from '../hooks/useWebcamRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useInterviewAssistant } from '../hooks/useInterviewAssistant';
import { submitInterviewHistory } from '../services/webhook';

interface InterviewSessionProps {
  phoneNumber: string;
  onComplete: (answers: Array<{question: string; answer: string}>) => void;
}

export const InterviewSession = memo(({ phoneNumber, onComplete }: InterviewSessionProps) => {
  const { 
    text, 
    isListening, 
    startListening, 
    stopListening, 
    resetText,
    error: speechError 
  } = useSpeechRecognition();
  const { startRecording, stopRecording, isRecording, videoBlob, error: recordError } = useWebcamRecorder();
  const { 
    isAiSpeaking, 
    error: aiError,
    initializeInterview,
    sendAnswer,
    stopSpeaking,
    cleanup
  } = useInterviewAssistant();

  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [answers, setAnswers] = useState<Array<{question: string; answer: string}>>([]);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [cameraError, setCameraError] = useState<string>('');

  const handleCameraError = useCallback((err: any) => {
    console.error('카메라 오류:', err);
    setCameraError('카메라 접근에 실패했습니다. 카메라 권한을 확인해주세요.');
  }, []);

  // 면접 초기화 - 한 번만 실행되도록 수정
  useEffect(() => {
    let isMounted = true; // cleanup을 위한 flag

    const initialize = async () => {
      // 이미 초기화되었거나 초기화 중이면 리턴
      if (isInitialized) {
        console.log('이미 초기화되었습니다.');
        return;
      }

      try {
        console.log('면접 초기화 시작');
        setIsButtonDisabled(true);
        
        const firstQuestion = await initializeInterview();
        
        // 컴포넌트가 언마운트되지 않았을 때만 상태 업데이트
        if (isMounted && firstQuestion) {
          setCurrentQuestion(firstQuestion);
          setIsInitialized(true);
          console.log('면접 시작 - 첫 질문:', firstQuestion);
          setIsButtonDisabled(false);
        }
      } catch (err) {
        console.error('Error initializing interview:', err);
        if (isMounted) {
          setIsButtonDisabled(false);
        }
      }
    };

    initialize();

    // cleanup 함수
    return () => {
      isMounted = false;
      cleanup();
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행되도록 함

  // 텍스트 상태 변화 감지를 위한 useEffect 추가
  useEffect(() => {
    if (text) {
      setIsButtonDisabled(true);  // 텍스트가 있으면 버튼 비활성화
    }
  }, [text]);

  // AI 응답 상태 변화 감지 (greeting 포함)
  useEffect(() => {
    // AI가 말하기 시작하면 버튼 비활성화
    if (isAiSpeaking) {
      console.log('AI 말하기 시작 - 버튼 비활성화:', isAiSpeaking);
      setIsButtonDisabled(true);
    } 
    // 새로운 질문이 설정되었을 때 버튼 비활성화
    else if (currentQuestion && !isAiSpeaking) {
      if (!isInitialized) {
        console.log('초기화 전 - 버튼 비활성화 유지');
        setIsButtonDisabled(true);
      } else {
        console.log('AI 말하기 종료 & 초기화 완료 - 버튼 활성화');
        setIsButtonDisabled(false);
        resetText();
      }
    }
  }, [isAiSpeaking, currentQuestion, isInitialized, resetText]);

  // 상태 변화 추적을 위한 useEffect 추가
  useEffect(() => {
    console.log('버튼 상태 확인과정:', { isButtonDisabled });
  }, [isButtonDisabled]);

  const handleSpeechToggle = async () => {
    if (!isInitialized) return;

    if (isListening) {
      try {
        const recognizedText = await stopListening();
        stopRecording();
        stopSpeaking();
        setIsAnswering(false);
        console.log('isListening', { isListening });

        if (recognizedText && typeof recognizedText === 'string') { // 답변 텍스트 확인 및 저장
          const newAnswer = {
            question: currentQuestion,
            answer: recognizedText
          };
          const newAnswers = [...answers, newAnswer];
          setAnswers(newAnswers);
          setIsButtonDisabled(true);  // 답변 후 버튼 비활성화
          console.log('버튼 상태2', { isButtonDisabled });

          // 한국 시간으로 timestamp 생성
          const koreanTime = new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });

          console.log('답변 전송:', {
            question: currentQuestion,
            answer: recognizedText,
            timestamp: koreanTime
          });
          
          // 답변 전송 및 AI 응답 대기
          const { text: response, isEnd } = await sendAnswer(recognizedText);
          setIsButtonDisabled(true);  // 답변 전송 후에도 버튼 비활성화 유지
          // 버튼은 계속 비활성화 상태 유지
          // AI 응답이 끝날 때까지 useEffect에서 활성화하지 않음

          if (isEnd) {
            const endMessage = "매니저에게 알림이 전송되었습니다. 잠시만 기다려주시기 바랍니다.";
            setCurrentQuestion(endMessage);
            setShowEndMessage(true);
            
            await submitInterviewHistory(phoneNumber, newAnswers);
            
            setTimeout(() => {
              onComplete(newAnswers);
            }, 3000);
            
            return;
          }

          setCurrentQuestion(response);
        }
      } catch (err) {
        console.error('답변 처리 중 오류:', err);
        setIsButtonDisabled(false);  // 에러 발생 시에만 버튼 활성화
      }
    } else {
      // 이전 답변이 있거나 AI가 말하는 중이면 새로운 답변 시작을 막음
      if (text || isAiSpeaking) {
        console.log('이전 답변 있음 또는 AI 말하는 중:', { text, isAiSpeaking });
        return;
      }

      try {
        await startListening();
        startRecording();
        setIsAnswering(true);
      } catch (err) {
        console.error('음성 인식 시작 중 오류:', err);
        setIsButtonDisabled(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full min-h-[100dvh] flex flex-col justify-start px-3 py-4 md:px-4 md:py-6"
    >
      {/* 카메라 미리보기 */}
      <div className="w-full max-w-[300px] min-w-[250px] md:max-w-[400px] md:min-w-[300px] h-full flex flex-col relative mx-auto mb-4 md:mb-6">
        <div className="w-full max-w-[250px] min-w-[250px] md:max-w-[300px] md:min-w-[300px] h-full max-h-[250px] min-h-[250px] md:max-h-[300px] md:min-h-[300px] mx-auto relative bg-black rounded-xl overflow-hidden">
          <WebcamPreview 
            isActive={true} 
            onError={handleCameraError}
          />
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-black/50 px-2 py-1 md:px-3 md:py-1 rounded-full">
            <p className="text-white text-xs md:text-sm">면접 진행중</p>
          </div>
        </div>
      </div>

      {/* 면접 컨텐츠 */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-3 md:p-6 border border-gray-200/50 dark:border-gray-700/50">
        {/* 상태 표시 */}
        <div className="mb-4 md:mb-6">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg flex items-center justify-center space-x-2"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full"
              />
              <span>
                {isAiSpeaking 
                  ? <div className="text-base md:text-2xl font-medium break-keep"> 면접관이 말하는 중...</div> 
                  : <div className="text-center text-sm md:text-xl break-keep">
                      질문을 다시 듣고 싶으시다면
                      <span className="font-semibold text-yellow-200">'다시 말씀해주세요.'</span> 라고 답변해주세요.
                    </div>
                }
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 답변 버튼 */}
        <div className="flex justify-center mb-3 md:mb-4">
          <AnimatePresence>
            {!showEndMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <SpeechButton
                  isListening={isListening}
                  onToggle={handleSpeechToggle}
                  isAiSpeaking={isAiSpeaking}
                  isAnswering={isAnswering}
                  disabled={!isInitialized || isButtonDisabled}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 면접 종료 메시지 */}
        <AnimatePresence>
          {showEndMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center text-sm md:text-xl text-gray-700 dark:text-gray-200 mb-3 md:mb-4 break-keep"
            >
              면접이 종료되었습니다. 수고하셨습니다.
            </motion.div>
          )}
        </AnimatePresence>

        {/* 답변 텍스트 표시 */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 md:p-4 shadow-sm min-h-[80px] md:min-h-[100px] mb-3 md:mb-4">
          <TextDisplay text={text} />
        </div>

        {/* 에러 메시지 */}
        <AnimatePresence>
          {(speechError || recordError || aiError) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-3 md:mt-4 p-2 md:p-3 bg-red-500 text-white text-xs md:text-sm rounded-lg text-center break-keep"
            >
              {speechError || recordError || aiError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

InterviewSession.displayName = 'InterviewSession'; 