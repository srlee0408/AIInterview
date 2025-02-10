import React from 'react';
import html2pdf from 'html2pdf.js';
import { Html2PdfOptions } from './types/pdf.types';

interface PdfGeneratorProps {
  contentRef: React.RefObject<HTMLDivElement>;
  name?: string;
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ contentRef, name }) => {
  // PDF 다운로드 함수
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      const originalStyles = window.getComputedStyle(contentRef.current);
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = contentRef.current.innerHTML;
      
      // A4 크기 계산 (mm 단위)
      const a4Width = 210;
      const a4Height = 297;

      // PDF용 스타일 설정
      const style = document.createElement('style');
      style.textContent = `
        .resume-container {
          width: ${a4Width - 20}mm;
          min-height: ${a4Height - 20}mm;
          margin: 0 auto;
          padding: 10mm;
          background-color: white;
          box-sizing: border-box;
        }
        .resume-content {
          font-family: Arial, sans-serif;
          line-height: 1.4;
          word-break: break-word;
          font-size: 10pt;
        }
        /* 테이블 스타일 수정 */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8pt;
          page-break-inside: avoid;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 4pt;
          text-align: left;
          font-size: 9pt;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        /* 각 섹션별 스타일 */
        .section {
          margin-bottom: 12pt;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 8pt;
          color: #2c3e50;
          border-bottom: 1.5pt solid #3498db;
          padding-bottom: 4pt;
        }
        /* 점수 표시 영역 */
        .score-table {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8pt;
          page-break-inside: avoid;
        }
        .score-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4pt;
          border: 1px solid #ddd;
        }
        /* 페이지 나누기 방지 */
        .no-break {
          page-break-inside: avoid;
        }
        /* 인쇄 시 배경색 보이도록 설정 */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `;

      // 원본 스타일을 임시 컨테이너에 적용
      tempContainer.className = 'resume-container';
      const contentDiv = tempContainer.querySelector('.resume-content');
      if (contentDiv) {
        Array.from(originalStyles).forEach(property => {
          (contentDiv as HTMLElement).style[property as any] = originalStyles.getPropertyValue(property);
        });
      }

      // 테이블을 감싸는 div에 no-break 클래스 추가
      const tables = tempContainer.getElementsByTagName('table');
      Array.from(tables).forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.className = 'no-break';
        table.parentNode?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      });

      tempContainer.prepend(style);

      // PDF 옵션 설정
      const options: Html2PdfOptions = {
        margin: [10, 10, 10, 10],
        filename: `이력서_${name || '미정'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          letterRendering: true,
          windowWidth: a4Width * 96 / 25.4,
          windowHeight: a4Height * 96 / 25.4,
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      // 이미지 로딩 완료 대기
      const images = tempContainer.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise((resolve, reject) => {
          if (img.complete) resolve(null);
          else {
            img.onload = () => resolve(null);
            img.onerror = reject;
          }
        });
      });

      await Promise.all(imagePromises);

      // PDF 생성
      await html2pdf()
        .set(options as any)
        .from(tempContainer)
        .save();

    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
      PDF 다운로드
    </button>
  );
}; 