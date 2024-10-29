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
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

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
      setIsAnswering(false);

      if (text) {
        const newAnswer = {
          question: currentQuestion,
          answer: text
        };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);

        console.log('답변 완료:', {
          question: currentQuestion,
          answer: text,
          timestamp: new Date().toISOString()
        });

        try {
          const { text: response, isEnd } = await sendAnswer(text);
          
          if (isEnd) {
            setCurrentQuestion("면접이 종료되었습니다. 매니저에게 알림이 전송되었습니다. 잠시만 기다려주시기 바랍니다.");
            setShowEndMessage(true);
            
            await submitInterviewHistory(phoneNumber, newAnswers);
            
            setTimeout(() => {
              onComplete(newAnswers);
            }, 3000);
            
            return;
          }

          setCurrentQuestion(response);
          console.log('AI 응답:', response);
        } catch (err) {
          console.error('Error:', err);
        }
      }
    } else {
      startListening();
      startRecording();
      setIsAnswering(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="w-full h-[25vh] md:h-[30vh] relative bg-black">
        <WebcamPreview isActive={true} onError={console.error} />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-50 p-2 bg-gradient-to-b from-white/80 dark:from-gray-800/80">
          <AnimatePresence>
            {isAiSpeaking && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blue-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center justify-center space-x-2 text-sm mx-auto max-w-[90%]"
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

        <div className="px-4 py-3">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 shadow-sm"
          >
            <h3 className="text-base md:text-lg font-medium text-gray-800 dark:text-white">
              {currentQuestion}
            </h3>
          </motion.div>
        </div>

        <div className="p-4">
          <SpeechButton
            isListening={isListening}
            onToggle={handleSpeechToggle}
            isAiSpeaking={isAiSpeaking}
            isAnswering={isAnswering}
          />
        </div>

        <div className="px-4 pb-safe">
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 shadow-sm">
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
            className="fixed bottom-0 left-0 right-0 p-4 bg-red-500 text-white text-sm text-center"
          >
            {speechError || recordError || aiError}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 