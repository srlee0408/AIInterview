import React, { useState, useEffect, useCallback } from 'react';
import { SpeechButton } from './components/SpeechButton';
import { TextDisplay } from './components/TextDisplay';
import { DarkModeToggle } from './components/DarkModeToggle';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const { text, isListening, startListening, stopListening, error } = useSpeechRecognition();
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

  const handleSpeechToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    <div className={`min-h-screen min-h-[calc(var(--vh,1vh)*100)] ${isDarkMode ? 'dark' : ''}`}>
      <div className="relative min-h-screen min-h-[calc(var(--vh,1vh)*100)] overflow-hidden bg-gradient-to-br from-background via-background to-background-dark dark:from-gray-900 dark:via-background-dark dark:to-black">
        {/* 배경 효과 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent"
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1,
            opacity: isListening ? 0.8 : 0.3,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="relative z-10 flex flex-col h-full">
          <div className="absolute top-4 right-4 z-20">
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
          </div>
          
          <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full px-4 py-6 md:py-12">
            <motion.div 
              className="flex flex-col items-center space-y-6 md:space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100/90 backdrop-blur-sm border border-red-400 text-red-700 px-6 py-3 rounded-lg shadow-lg max-w-[90vw] md:max-w-md"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <span className="block text-sm md:text-base text-center">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full flex-1 flex flex-col justify-center">
                <SpeechButton
                  isListening={isListening}
                  onToggle={handleSpeechToggle}
                />
              </div>

              <div className="w-full">
                <TextDisplay text={text} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
