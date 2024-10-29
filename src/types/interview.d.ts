export interface InterviewQuestion {
  text: string;
  hint: string;
  timeLimit: number;
}

export interface InterviewAnswer {
  question: string;
  answer: string;
}

export interface InterviewResult {
  phoneNumber: string;
  answers: InterviewAnswer[];
  createdAt?: Date;
  videoUrl?: string;
} 