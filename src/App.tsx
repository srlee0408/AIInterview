import React, { useState, useEffect } from 'react';
import { DarkModeToggle } from './components/DarkModeToggle';
import { InterviewSession } from './components/InterviewSession';
import { InterviewPrep } from './components/InterviewPrep';
import { PhoneInput } from './components/PhoneInput';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

type AppStep = 'phone' | 'prep' | 'interview';

interface InterviewAnswer {
  question: string;
  answer: string;
}

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setCurrentStep('prep');
  };

  const handlePrepComplete = () => {
    setCurrentStep('interview');
  };

  const handleInterviewComplete = (interviewAnswers: InterviewAnswer[]) => {
    setAnswers(interviewAnswers);
    setPhoneNumber('');
    setAnswers([]);
    setCurrentStep('phone');
  };

  return (
    <div className={`min-h-screen min-h-[calc(var(--vh,1vh)*100)] ${isDarkMode ? 'dark' : ''}`}>
      <div className="relative min-h-screen min-h-[calc(var(--vh,1vh)*100)] overflow-hidden bg-gradient-to-br from-background via-background to-background-dark dark:from-gray-900 dark:via-background-dark dark:to-black">
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
          <div className="absolute top-4 right-4 z-20">
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
          </div>
          
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full px-4 py-6 md:py-12">
            <AnimatePresence mode="wait">
              {currentStep === 'phone' && (
                <PhoneInput onSubmit={handlePhoneSubmit} />
              )}
              {currentStep === 'prep' && (
                <InterviewPrep onStart={handlePrepComplete} />
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

export default App;
