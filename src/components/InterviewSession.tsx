import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
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

export const InterviewSession = ({ phoneNumber, onComplete }: InterviewSessionProps) => {
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
    stopSpeaking
  } = useInterviewAssistant();

  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [answers, setAnswers] = useState<Array<{question: string; answer: string}>>([]);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // 면접 초기화
  useEffect(() => {
    const initialize = async () => {
      if (isInitialized) return;

      try {
        // 초기화 시작 시 버튼은 비활성화 상태 유지
        setIsButtonDisabled(true);
        
        const greeting = await initializeInterview();
        if (greeting) {
          setCurrentQuestion(greeting);
          setIsInitialized(true);
          console.log('면접 시작 - 안내 메시지:', greeting);
          setIsButtonDisabled(false);
          // AI가 말하기를 끝내면 useEffect에서 버튼이 활성화됨
        }
      } catch (err) {
        console.error('Error initializing interview:', err);
      }
    };

    initialize();
  }, [initializeInterview, isInitialized]);
  
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="w-full max-w-[400px] min-w-[300px] h-full flex flex-col relative">
        <div className="w-full max-w-[300px] min-w-[300px] h-full max-h-[300px] min-h-[300px] mx-auto relative bg-black">
          <div className="absolute inset-0">
            <WebcamPreview isActive={true} onError={console.error} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-50 p-1 bg-gradient-to-b from-white/80 dark:from-gray-800/80">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blue-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center justify-center space-x-2 text-xl mx-auto max-w-[90%]"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-white rounded-full"
                />
                <span>
                  {isAiSpeaking 
                    ? "면접관이 말하는 중..." 
                    : <div className="text-center">
                      질문을 다시 듣고 싶으시다면
                      <br />
                      <span className="font-semibold text-yellow-200">'다시 말씀해주세요.'</span> 라고 답변해주세요.
                    </div>
                  }
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* <div className="px-4 py-1">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-sm"
            >
              <h2 className="text-base md:text-2xl font-medium text-gray-800 dark:text-white">
                {currentQuestion}
              </h2>
            </motion.div>
          </div> */}

          <div className="px-4 py-1 flex justify-center">
            <SpeechButton
              isListening={isListening}
              onToggle={handleSpeechToggle}
              isAiSpeaking={isAiSpeaking}
              isAnswering={isAnswering}
              disabled={!isInitialized || isButtonDisabled}
            />
          </div>
          <div className="px-4 pb-1">
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 shadow-sm min-h-[100px]">
              <TextDisplay text={text} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {(speechError || recordError || aiError) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-0 left-0 right-0 p-4 bg-red-500 text-white text-sm text-center max-w-[480px] mx-auto"
            >
              {speechError || recordError || aiError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}; 