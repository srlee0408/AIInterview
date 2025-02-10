// 이 파일은 Resume 관련 유틸 함수와 타입들을 모아둔 파일입니다.

export interface InterviewData {
  name: string;
  phone: string;
  birth: string;
  resumer_history: string;
  summary: string;
  evaluation: string;
  resume_html: string;
  createdate: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'phone' | 'createdate';

export interface ResumeFormData {
  profileImage: string;
  name: string;
  position: string;
  basicInfo: {
    성명: string;
    희망근무형태: string;
    근무가능시간: string;
    희망급여: string;
    입사가능일: string;
    운전면허: string;
    자차운행: string;
    급여수령: string;
    거주지: string;
    연락처: string;
    이메일: string;
  };
  scores: {
    근속: { score: number; reason: string };
    근태: { score: number; reason: string };
    수용성: { score: number; reason: string };
    체력: { score: number; reason: string };
    배송업적합성: { score: number; reason: string };
    디지털기기사용능력: { score: number; reason: string };
  };
  experience: string[];
  evaluation: {
    totalScore: number;
    status: string;
    recommendations: string[];
    concerns: string[];
    specialNotes: string[];
  };
}

// 마크다운 텍스트를 순수 텍스트로 변환하는 함수
export const convertMarkdownToText = (markdown: string): string => {
  return markdown
    .replace(/#{1,6}\s/g, '') // 헤더 제거
    .replace(/\*\*/g, '')     // 볼드체 제거
    .replace(/\*/g, '')       // 이탤릭체 제거
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // 링크 제거
    .replace(/\n\s*[-*+]\s/g, '\n• ')
    .replace(/---/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// 전화번호 포맷팅 함수
export const formatPhoneNumber = (phone: string): string => {
  const numbers = phone.replace(/[^0-9]/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
  } else {
    return phone;
  }
};

// HTML을 ResumeFormData 객체로 파싱하는 함수
export const parseHtmlToData = (html: string): ResumeFormData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // HTML에서 필요한 데이터를 추출하는 로직이 필요합니다.
  return {
    profileImage: '',
    name: '',
    position: '',
    basicInfo: {
      성명: '',
      희망근무형태: '',
      근무가능시간: '',
      희망급여: '',
      입사가능일: '',
      운전면허: '',
      자차운행: '',
      급여수령: '',
      거주지: '',
      연락처: '',
      이메일: ''
    },
    scores: {
      근속: { score: 0, reason: '' },
      근태: { score: 0, reason: '' },
      수용성: { score: 0, reason: '' },
      체력: { score: 0, reason: '' },
      배송업적합성: { score: 0, reason: '' },
      디지털기기사용능력: { score: 0, reason: '' }
    },
    experience: [],
    evaluation: {
      totalScore: 0,
      status: '',
      recommendations: [],
      concerns: [],
      specialNotes: []
    }
  };
};

// ResumeFormData를 HTML 문자열로 변환하는 함수
export const convertDataToHtml = (data: ResumeFormData): string => {
  // 이력서 데이터를 HTML로 변환하는 로직이 필요합니다.
  return '';
}; 