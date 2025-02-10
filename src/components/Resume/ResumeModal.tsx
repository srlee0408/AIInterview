import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 이력서 모달 컴포넌트 (편집 가능)
interface ResumeModalProps {
  html: string;
  id: string;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const ResumeModal = ({ html, id, onClose, onSaveSuccess }: ResumeModalProps) => {
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