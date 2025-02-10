import React, { useState } from 'react';

// 이력서 모달 컴포넌트 (편집 가능)
interface ResumeModalProps {
  html: string;
  onClose: () => void;
  onSave?: (updatedHtml: string) => void;
}

export const ResumeModal = ({ html, onClose, onSave }: ResumeModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const contentRef = React.useRef<HTMLDivElement>(null);

  // 수정한 내용을 저장하는 함수
  const handleSave = async () => {
    if (onSave && contentRef.current) {
      const updatedHtml = contentRef.current.innerHTML;
      await onSave(updatedHtml);
      setIsEditing(false);
    }
  };

  // 이미지 업로드 처리 함수
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        if (contentRef.current) {
          const imgElement = contentRef.current.querySelector('img');
          if (imgElement) {
            imgElement.src = reader.result as string;
          }
        }
      };
      reader.readAsDataURL(file);
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
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  저장
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
      </div>
    </div>
  );
}; 