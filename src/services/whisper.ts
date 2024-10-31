import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface WhisperTranscriptionResult {
  text: string;
  language: string;
}

export class WhisperService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      // 이전 스트림이 있다면 정리
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      // 새로운 스트림 생성
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // 1초 단위로 청크 생성
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('음성 녹음을 시작할 수 없습니다.');
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('녹음이 시작되지 않았습니다.'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        // 오디오 청크들을 하나의 Blob으로 합치기
        const audioBlob = new Blob(this.audioChunks, { 
          type: 'audio/webm;codecs=opus' 
        });
        this.audioChunks = [];

        // 스트림 정리
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  async transcribe(audioBlob: Blob): Promise<WhisperTranscriptionResult> {
    try {
      // Blob을 File 객체로 변환
      const audioFile = new File([audioBlob], 'audio.webm', {
        type: 'audio/webm;codecs=opus'
      });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'ko',
        response_format: 'verbose_json',
        temperature: 0.2,
        prompt: '이것은 면접 답변입니다. 명확하고 전문적인 어투로 변환해주세요.'
      });

      return {
        text: transcription.text,
        language: transcription.language || 'ko'
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw new Error('음성 인식에 실패했습니다.');
    }
  }

  // 리소스 정리
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}

// 싱글톤 인스턴스 생성
export const whisperService = new WhisperService();