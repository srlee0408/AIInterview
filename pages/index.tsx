import React, { useState } from 'react';

export default function Home() {
    const [text, setText] = useState<string>('');
    const [isRecording, setIsRecording] = useState<boolean>(false)

    const handleListen = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setText(transcript);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
            console.error(event.error);
            setIsRecording(false);
        };

        recognition.start();
    };

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={handleListen} disabled={isRecording}>
                {isRecording ? 'Listening...' : 'Start Listening'}
            </button>
            <div style={{ marginTop: '20px', fontSize: '18px' }}>
                {text}
            </div>
        </div>
    );
}
