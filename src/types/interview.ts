// 면접 답변 타입
export interface InterviewAnswer {
  question: string;
  answer: string;
}

// 앱 단계 타입
export type AppStep = 'phone' | 'camera' | 'microphone' | 'checklist' | 'prep' | 'interview' | 'tutorial'; 