import React, { useState } from 'react';

function SpeechRecognitionComponent() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Web Speech API is not supported by this browser.');
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            setTranscript(event.results[0][0].transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <div>
            <button onClick={startListening} disabled={isListening}>
                {isListening ? 'Listening...!!!!' : 'Start Listening'}
            </button>
            <p>Transcript: {transcript}</p>
        </div>
    );
}

export default SpeechRecognitionComponent;
