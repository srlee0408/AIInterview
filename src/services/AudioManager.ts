export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private compressor: DynamicsCompressorNode;
  
  private constructor() {
    this.audioContext = new AudioContext();
    
    // 컴프레서 설정
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -24;  // dB
    this.compressor.knee.value = 30;        // dB
    this.compressor.ratio.value = 12;       // 압축비
    this.compressor.attack.value = 0.003;   // 초
    this.compressor.release.value = 0.25;   // 초
    
    // 게인 노드 설정
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.9;  // 기본 볼륨 90%
    
    // 노드 연결: 컴프레서 -> 게인 -> 출력
    this.compressor.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
  }
  
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
  
  async playAudio(audioData: ArrayBuffer): Promise<AudioBufferSourceNode> {
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // 소스를 컴프레서에 연결
      source.connect(this.compressor);
      source.start(0);
      
      return source;
    } catch (error) {
      console.error('Audio processing error:', error);
      throw error;
    }
  }
  
  setVolume(value: number) {
    // 볼륨값 범위 제한: 0.0 ~ 1.0
    const normalizedValue = Math.max(0, Math.min(1, value));
    this.gainNode.gain.value = normalizedValue;
  }
}
