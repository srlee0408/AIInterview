import React, { useState, useEffect } from 'react';
import { PhoneInput } from './components/PhoneInput';
import { InterviewSession } from './components/InterviewSession';
import { InterviewPrep } from './components/InterviewPrep';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { CameraCheck } from './components/CameraCheck';
import { MicrophoneCheck } from './components/MicrophoneCheck';
import { Tutorial } from './components/Tutorial';
import { AppStep, InterviewAnswer } from './types/interview';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Resume } from './components/Resume';

function MainApp() {
  const [currentStep, setCurrentStep] = useState<AppStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);

  // 모바일 뷰포트 높이 설정
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    return () => window.removeEventListener('resize', setVH);
  }, []);

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setCurrentStep('camera');
  };

  const handleCameraComplete = () => {
    setCurrentStep('microphone');
  };

  const handleMicrophoneComplete = () => {
    setCurrentStep('checklist');
  };

  const handlePrepComplete = () => {
    setCurrentStep('tutorial');
  };

  const handleTutorialComplete = (/* 인터뷰 관련 인자 필요 시 */) => {
    setCurrentStep('interview');
  };

  const handleInterviewComplete = (interviewAnswers: InterviewAnswer[]) => {
    setAnswers(interviewAnswers);
    setPhoneNumber('');
    setAnswers([]);
    setCurrentStep('phone');
  };

  return (
    <div className="min-h-screen min-h-[calc(var(--vh,1vh)*100)] dark">
      <div className="relative min-h-screen min-h-[calc(var(--vh,1vh)*100)] overflow-hidden bg-gradient-to-br from-gray-900 via-background-dark to-black">
        {/* 배경 효과 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full px-4 py-6 md:py-12">
            <AnimatePresence mode="wait">
              {currentStep === 'phone' && (
                <PhoneInput onSubmit={handlePhoneSubmit} />
              )}
              {currentStep === 'camera' && (
                <CameraCheck onComplete={handleCameraComplete} />
              )}
              {currentStep === 'microphone' && (
                <MicrophoneCheck onComplete={handleMicrophoneComplete} />
              )}
              {currentStep === 'checklist' && (
                <InterviewPrep onStart={handlePrepComplete} />
              )}
              {currentStep === 'tutorial' && (
                <Tutorial onComplete={handleTutorialComplete} />
              )}
              {currentStep === 'interview' && (
                <InterviewSession 
                  phoneNumber={phoneNumber}
                  onComplete={handleInterviewComplete}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// 배경 컴포넌트를 별도로 분리
const Background: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen min-h-[calc(var(--vh,1vh)*100)] dark">
      <div className="relative min-h-screen min-h-[calc(var(--vh,1vh)*100)] overflow-hidden bg-gradient-to-br from-gray-900 via-background-dark to-black">
        {/* 배경 효과 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="relative z-10 flex flex-col h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Background>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Background>
    </Router>
  );
}

export default App;
