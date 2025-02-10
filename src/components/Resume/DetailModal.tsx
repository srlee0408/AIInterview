import React from 'react';
import { InterviewData, formatPhoneNumber, convertMarkdownToText } from './resumeUtils';

// 상세 정보 모달 컴포넌트 (면접자 정보 표시)
interface DetailModalProps {
  item: InterviewData;
  onClose: () => void;
}

export const DetailModal = ({ item, onClose }: DetailModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">상세 정보</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="space-y-4">
          {/* 기본 정보 */}
          <div>
            <h3 className="font-semibold mb-2 dark:text-white">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">이름</p>
                <p className="dark:text-white">{item.name}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">연락처</p>
                <p className="dark:text-white">{item.phone}</p>
              </div>
            </div>
          </div>

          {/* 면접 내용 */}
          <div>
            <h3 className="font-semibold mb-2 dark:text-white">면접 내용</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              {item.resumer_history ? (
                <p className="whitespace-pre-wrap dark:text-white">{item.resumer_history}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">평가 중...</p>
              )}
            </div>
          </div>

          {/* 면접 요약 */}
          <div>
            <h3 className="font-semibold mb-2 dark:text-white">면접 요약</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              {item.summary ? (
                <p className="whitespace-pre-wrap dark:text-white">{item.summary}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">평가 중...</p>
              )}
            </div>
          </div>

          {/* 면접 평가 */}
          <div>
            <h3 className="font-semibold mb-2 dark:text-white">면접 평가</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              {item.evaluation ? (
                <p className="whitespace-pre-wrap dark:text-white">{item.evaluation}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">평가 중...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 