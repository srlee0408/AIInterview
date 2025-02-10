// PDF 생성에 필요한 타입 정의
export interface Html2PdfOptions {
  margin?: number | [number, number, number, number];
  filename?: string;
  image?: {
    type?: string;
    quality?: number;
  };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    letterRendering?: boolean;
    windowWidth?: number;
    windowHeight?: number;
  };
  jsPDF?: {
    unit?: string;
    format?: string;
    orientation?: 'portrait' | 'landscape';
    compress?: boolean;
  };
} 