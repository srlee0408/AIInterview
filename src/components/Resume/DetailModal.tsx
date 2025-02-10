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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">연락처</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatPhoneNumber(item.phone)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">생년월일</p>
              <p className="font-medium text-gray-900 dark:text-white">{item.birth}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">생성일</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(item.createdate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* 면접 내용 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">면접 내용</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {item.resumer_history}
              </p>
            </div>
          </div>

          {/* AI 요약 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI 요약</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {convertMarkdownToText(item.summary)}
              </p>
            </div>
          </div>

          {/* AI 평가 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI 평가</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {convertMarkdownToText(item.evaluation)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 