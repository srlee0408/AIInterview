import { createThread, addMessage, runAssistant, getResponse } from './assistant';
import { textToSpeech, playAudio } from './elevenlabs';

interface InterviewManager {
  threadId: string | null;
  isAiSpeaking: boolean;
  currentAudioSource: AudioBufferSourceNode | null;
}

class InterviewService {
  private manager: InterviewManager = {
    threadId: null,
    isAiSpeaking: false,
    currentAudioSource: null
  };

  async initialize() {
    try {
      const thread = await createThread();
      this.manager.threadId = thread.id;
      
      // 초기 메시지 전송
      const initialResponse = await this.sendMessage("면접을 시작합니다. 자기소개 부탁드립니다.");
      await this.speakResponse(initialResponse);
      
      return initialResponse;
    } catch (error) {
      console.error('Error initializing interview:', error);
      throw new Error('면접 초기화에 실패했습니다.');
    }
  }

  async sendMessage(message: string) {
    if (!this.manager.threadId) {
      throw new Error('면접이 초기화되지 않았습니다.');
    }

    try {
      await addMessage(this.manager.threadId, message);
      const run = await runAssistant(this.manager.threadId);
      const response = await getResponse(this.manager.threadId, run.id);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('메시지 전송에 실패했습니다.');
    }
  }

  async speakResponse(text: string) {
    try {
      this.manager.isAiSpeaking = true;
      const audioData = await textToSpeech(text);
      const source = await playAudio(audioData);
      this.manager.currentAudioSource = source;

      return new Promise<void>((resolve) => {
        source.onended = () => {
          this.manager.isAiSpeaking = false;
          this.manager.currentAudioSource = null;
          resolve();
        };
      });
    } catch (error) {
      console.error('Error speaking response:', error);
      this.manager.isAiSpeaking = false;
      throw new Error('음성 생성에 실패했습니다.');
    }
  }

  stopSpeaking() {
    if (this.manager.currentAudioSource) {
      this.manager.currentAudioSource.stop();
      this.manager.currentAudioSource = null;
    }
    this.manager.isAiSpeaking = false;
  }

  isAiSpeaking() {
    return this.manager.isAiSpeaking;
  }
}

export const interviewService = new InterviewService(); 