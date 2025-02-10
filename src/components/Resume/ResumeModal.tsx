import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 이력서 모달 컴포넌트 (편집 가능)
interface ResumeModalProps {
  html: string;
  id: string;
  onClose: () => void;
  onSaveSuccess: () => void;
}

// 이미지 URL 압축 함수
// 긴 URL을 짧은 코드로 변환 (예: Airtable 저장 시 사용)
const compressImageUrls = (html: string): string => {
  // 압축 대상 이미지 매핑 정보 (추후 외부에서 주입 가능)
  const urlMap: Record<string, string> = {
    "img1": "https://example.com/very/long/image/url/image1.jpg",
    "img2": "https://example.com/another/very/long/image/url/image2.png"
  };

  // 정규식에서 특수문자 이스케이프 처리 함수
  const escapeRegExp = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // urlMap에 정의된 원본 URL을 찾아 짧은 코드로 치환
  for (const key in urlMap) {
    if (Object.prototype.hasOwnProperty.call(urlMap, key)) {
      const originalUrl = urlMap[key];
      const regex = new RegExp(escapeRegExp(originalUrl), 'g');
      html = html.replace(regex, key);
    }
  }
  return html;
};

export const ResumeModal = ({ html, id, onClose, onSaveSuccess }: ResumeModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // 수정한 내용을 저장하는 함수
  const handleSave = async () => {
    if (contentRef.current) {
      setIsSaving(true);
      try {
        let updatedHtml = contentRef.current.innerHTML;
        // ID 값 확인
        if (!id) {
          throw new Error('이력서 ID가 없습니다.');
        }
        
        // 긴 이미지 URL을 짧은 코드로 변환하여 압축 처리
        const compressedHtml = compressImageUrls(updatedHtml);

        console.log('저장 요청 데이터:', { id, htmlLength: compressedHtml.length }); // 개발용 로그

        const response = await fetch(process.env.REACT_APP_RESUME_SAVE_WEBHOOK_URL!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            ID: id,
            resume_html: compressedHtml
          })
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
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setProfileImage(blobUrl);
      if (contentRef.current) {
        const imgElement = contentRef.current.querySelector('img');
        if (imgElement) {
          imgElement.src = blobUrl;
        }
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
                      저장 중...
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
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                수정
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div
          ref={contentRef}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          className={`resume-content ${isEditing ? 'border border-gray-300 rounded-lg p-4' : ''}`}
          dangerouslySetInnerHTML={{ __html: html }}
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