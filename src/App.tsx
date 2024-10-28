import React, { useState, useEffect } from 'react';
import { SpeechButton } from './components/SpeechButton';
import { TextDisplay } from './components/TextDisplay';
import { WaveVisualizer } from './components/WaveVisualizer';
import { DarkModeToggle } from './components/DarkModeToggle';
import { StatusIndicator } from './components/StatusIndicator';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import './App.css';

function App() {
  const { text, isListening, startListening, stopListening, error } = useSpeechRecognition();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-background dark:bg-background-dark min-h-screen p-8 transition-colors duration-200">
        <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
        
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              음성 인식 프로그램
            </h1>
            
            <StatusIndicator isListening={isListening} />
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <SpeechButton
              isListening={isListening}
              onStart={startListening}
              onStop={stopListening}
            />

            <WaveVisualizer isListening={isListening} />

            <TextDisplay text={text} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
