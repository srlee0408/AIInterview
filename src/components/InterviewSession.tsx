import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SpeechButton } from './SpeechButton';
import { TextDisplay } from './TextDisplay';
import { WebcamPreview } from './WebcamPreview';
import { useWebcamRecorder } from '../hooks/useWebcamRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useInterviewAssistant } from '../hooks/useInterviewAssistant';

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

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answers, setAnswers] = useState<Array<{question: string; answer: string}>>([]);

  // 면접 초기화
  useEffect(() => {
    const initialize = async () => {
      try {
        const firstQuestion = await initializeInterview();
        setCurrentQuestion(firstQuestion);
        console.log('면접 시작 - 첫 질문:', firstQuestion);
      } catch (err) {
        console.error('Error initializing interview:', err);
      }
    };

    initialize();
  }, [initializeInterview]);

  const handleSpeechToggle = async () => {
    if (isListening) {
      stopListening();
      stopRecording();
      stopSpeaking();

      if (text) {
        const newAnswer = {
          question: currentQuestion,
          answer: text
        };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);

        console.log('답변 완료:', {
          question: currentQuestion,
          answer: text
        });

        try {
          const response = await sendAnswer(text);
          setCurrentQuestion(response);
          console.log('AI 응답:', response);
        } catch (err) {
          console.error('Error getting next question:', err);
        }
      }
    } else {
      startListening();
      startRecording();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto p-4 md:p-6"
    >
      <div className="space-y-6">
        <WebcamPreview isActive={true} onError={console.error} />
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          {/* AI 말하는 중 표시 - 상단 고정 */}
          <div className="sticky top-0 z-50 mb-6">
            <AnimatePresence>
              {isAiSpeaking && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                  <span className="font-medium">AI 면접관이 말하는 중...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 현재 질문 영역 - 구분선으로 분리 */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {currentQuestion}
              </h3>
            </motion.div>
          </div>

          {/* 음성 인식 버튼 영역 */}
          <div className="mb-8">
            <SpeechButton
              isListening={isListening}
              onToggle={handleSpeechToggle}
            />
          </div>

          {/* 텍스트 표시 영역 - 별도의 카드로 분리 */}
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 backdrop-blur-sm">
            <TextDisplay text={text} />
          </div>

          {/* 에러 메시지 - 하단 고정 */}
          <AnimatePresence>
            {(speechError || recordError || aiError) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md mx-auto"
              >
                <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg text-center">
                  {speechError || recordError || aiError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}; 