import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SpeechButton } from './SpeechButton';
import { TextDisplay } from './TextDisplay';
import { WebcamPreview } from './WebcamPreview';
import { useWebcamRecorder } from '../hooks/useWebcamRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useInterviewAssistant } from '../hooks/useInterviewAssistant';
import { submitInterviewHistory } from '../services/webhook';
import { InterviewPrep } from './InterviewPrep';

interface InterviewSessionProps {
  phoneNumber: string;
  onComplete: (answers: Array<{question: string; answer: string}>) => void;
}

export const InterviewSession = ({ phoneNumber, onComplete }: InterviewSessionProps) => {
  const { text, isListening, startListening, stopListening, error: speechError } = useSpeechRecognition();
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
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleSpeechToggle = async () => {
    console.log('isInitialized: ', isInitialized);
    if (!isInitialized) return;
    console.log('isListening: ', isListening);

    if (isListening) {
      try {
        const recognizedText = await stopListening();
        stopRecording();
        stopSpeaking();
        setIsAnswering(false);
        
        if (recognizedText && typeof recognizedText === 'string') {
          
          const newAnswer = {
            question: currentQuestion,
            answer: recognizedText
          };
          const newAnswers = [...answers, newAnswer];
          setAnswers(newAnswers);

          console.log('답변 전송:', {
            question: currentQuestion,
            answer: recognizedText,
            timestamp: new Date().toISOString()
          });

          const { text: response, isEnd } = await sendAnswer(recognizedText);
          console.log('AI 응답 받음:', { response, isEnd });
          
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
          setIsButtonDisabled(false);
        }
      } catch (err) {
        console.error('답변 처리 중 오류:', err);
        setIsButtonDisabled(false);
      }
    } else {
      try {
        await startListening();
        startRecording();
        setIsAnswering(true);
        setIsButtonDisabled(false);
      } catch (err) {
        console.error('음성 인식 시작 중 오류:', err);
        setIsButtonDisabled(false);
      }
    }
  };

  // 면접 초기화
  useEffect(() => {
    const initialize = async () => {
      if (isInitialized) return;

      try {
        const greeting = await initializeInterview();
        if (greeting) {
          setCurrentQuestion(greeting);
          setIsInitialized(true);
          console.log('면접 시작 - 안내 메시지:', greeting);
        }
      } catch (err) {
        console.error('Error initializing interview:', err);
      }
    };

    initialize();
  }, [initializeInterview, isInitialized]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="w-full max-w-[400px] min-w-[320px] h-full flex flex-col relative">
        <div className="w-full max-w-[300px] min-w-[100px] h-full max-h-[300px] min-h-[100px] mx-auto relative bg-black">
          <div className="absolute inset-0">
            <WebcamPreview isActive={true} onError={console.error} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-50 p-1 bg-gradient-to-b from-white/80 dark:from-gray-800/80">
            <AnimatePresence>
              {isAiSpeaking && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-blue-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center justify-center space-x-2 text-sm mx-auto max-w-[90%]"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-white rounded-full"
                  />
                  <span>AI 면접관이 말하는 중...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-4 py-1">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-sm"
            >
              <h3 className="text-base md:text-lg font-medium text-gray-800 dark:text-white">
                {currentQuestion}
              </h3>
            </motion.div>
          </div>

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