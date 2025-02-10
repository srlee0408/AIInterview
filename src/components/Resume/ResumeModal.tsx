import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';

// PDF 옵션 타입 정의
interface Html2PdfOptions {
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
  };
  jsPDF?: {
    unit?: string;
    format?: string;
    orientation?: 'portrait' | 'landscape';
    compress?: boolean;
  };
}

// 이력서 모달 컴포넌트 (편집 가능)
interface ResumeModalProps {
  html: string;
  id: string;
  name?: string;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const ResumeModal = ({ html, id, name, onClose, onSaveSuccess }: ResumeModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedHtml, setEditedHtml] = useState(html); // 수정된 HTML 저장
  const [profileImage, setProfileImage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // HTML이 변경될 때마다 상태 업데이트
  React.useEffect(() => {
    setEditedHtml(html);
  }, [html]);

  // 수정한 내용을 저장하는 함수
  const handleSave = async () => {
    if (contentRef.current) {
      setIsSaving(true);
      try {
        let updatedHtml = contentRef.current.innerHTML;

        // 이미지 태그를 변경하지 않고 그대로 사용
        setEditedHtml(updatedHtml);

        if (!id) {
          throw new Error('이력서 ID가 없습니다.');
        }

        // FormData 객체 생성
        const formData = new FormData();
        formData.append('ID', id);
        formData.append('resume_html', updatedHtml);

        // Base64 이미지를 Blob으로 변환하여 추가
        if (profileImage) {
          // Base64 문자열에서 실제 데이터 부분만 추출
          const base64Data = profileImage.split(',')[1];
          // Base64를 Blob으로 변환
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }

          const blob = new Blob(byteArrays, { type: 'image/jpeg' });
          formData.append('image', blob, 'profile.jpg');
        }

        console.log('저장 요청 데이터:', { 
          id, 
          htmlLength: updatedHtml.length,
          hasImage: !!profileImage
        }); 

        const response = await fetch(process.env.REACT_APP_RESUME_SAVE_WEBHOOK_URL!, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`저장 실패: ${response.status}, ${errorText}`);
        }

        const data = await response.json();
        console.log('저장 응답:', data);
        
        if (data.success === true) {
          setShowSuccess(true);
          onSaveSuccess();
          const message = data.message || '저장이 완료되었습니다';
          setTimeout(() => {
            setShowSuccess(false);
            setIsEditing(false);
          }, 2000);
        } else {
          throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('이력서 저장 오류:', error);
        alert(error instanceof Error ? error.message : '이력서 저장에 실패했습니다.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // 이미지 업로드 처리 함수
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // 이미지 크기 체크 (예: 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('이미지 크기는 5MB를 초과할 수 없습니다.');
        }

        // Base64로 변환
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setProfileImage(base64String);
          
          // HTML 내의 이미지 태그 업데이트
          if (contentRef.current) {
            const imgElement = contentRef.current.querySelector('img');
            if (imgElement) {
              imgElement.src = base64String;
              setEditedHtml(contentRef.current.innerHTML); // 변경된 HTML 저장
            }
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('이미지 업로드 오류:', error);
        alert(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.');
      }
    }
  };

  // PDF 다운로드 함수 수정
  const handleDownloadPDF = async () => {
    if (contentRef.current) {
      try {
        // PDF 생성을 위한 임시 컨테이너 생성
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = contentRef.current.innerHTML;
        
        // 이미지 로딩 완료 대기
        const images = tempContainer.getElementsByTagName('img');
        const imageLoadPromises = Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        });

        // 모든 이미지가 로드될 때까지 대기
        await Promise.all(imageLoadPromises);

        // PDF 옵션 설정
        const options: Html2PdfOptions = {
          margin: [7, 7, 7, 7], // 상, 우, 하, 좌 여백
          filename: `이력서_${name || '미정'}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            letterRendering: true
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' as 'portrait' | 'landscape',
            compress: true
          }
        };

        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            margin: 7mm;
            size: A4;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          .resume-content {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            word-break: break-word;
          }
          /* 각 역량 및 점수 평가 부분이 한 페이지에 같이 나오도록 설정 */
          .evaluation-section, .competency-section, .score-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        `;
        tempContainer.prepend(style);

        // HTML을 PDF로 변환
        await html2pdf()
          .set(options as any)
          .from(tempContainer)
          .save();

      } catch (error) {
        console.error('PDF 다운로드 오류:', error);
        alert('PDF 다운로드에 실패했습니다. 이미지 로딩에 문제가 있을 수 있습니다.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className={`px-4 py-2 text-white rounded flex items-center gap-2
                    ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      반영 중...
                    </>
                  ) : '저장'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  취소
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image-upload"
                />
                <label
                  htmlFor="profile-image-upload"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                >
                  이미지 변경
                </label>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  수정
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  PDF 다운로드
                </button>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div
          ref={contentRef}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          className={`resume-content ${isEditing ? 'border border-gray-300 rounded-lg p-4' : ''}`}
          dangerouslySetInnerHTML={{ __html: editedHtml }} // 수정된 HTML 사용
          style={{
            outline: 'none',
            minHeight: '500px'
          }}
        />

        {/* 저장 완료 알림 */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 
                       bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              저장이 완료되었습니다
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 