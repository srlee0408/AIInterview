import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewData, SortDirection, SortField } from './resumeUtils';
import { ResumeModal } from './ResumeModal';
import { DetailModal } from './DetailModal';

// 메인 이력서 컴포넌트 (테이블, 정렬, 페이지네이션 포함)
export const Resume = () => {
  // 환경변수 확인을 위한 useEffect 추가
  useEffect(() => {
    console.log('환경변수 상태:', {
      fetchUrl: process.env.REACT_APP_RESUME_FETCH_WEBHOOK_URL,
      nodeEnv: process.env.NODE_ENV
    });
  }, []);

  const [interviewData, setInterviewData] = useState<InterviewData[]>([]);
  const [selectedItem, setSelectedItem] = useState<InterviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showResume, setShowResume] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 데이터 가져오기 함수를 컴포넌트 레벨로 이동
  const fetchInterviewData = async () => {
    try {
      const webhookUrl = process.env.REACT_APP_RESUME_FETCH_WEBHOOK_URL || '';
      
      if (!webhookUrl) {
        throw new Error('Webhook URL이 설정되지 않았습니다. 환경변수를 확인해주세요.');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          action: 'fetch_resume_data'
        })
      });
      
      if (!response.ok) {
        throw new Error(`데이터를 불러오는데 실패했습니다. Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 받은 데이터 전체를 콘솔에 출력
      console.log('웹훅으로 받은 원본 데이터:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('서버에서 받은 데이터가 배열 형식이 아닙니다.');
      }
      
      const mappedData = data.map((item: any) => {
        return {
          id: item.ID || '',
          name: item.name || '',
          phone: item.phone || '',
          birth: item.birth || '',
          resumer_history: item.resumer_history || '',
          summary: item.summary || '',
          evaluation: item.evaluation || '',
          resume_html: item.resume_html || '',
          createdate: item.createdate || '',
          image: item.image || ''
        };
      });
      
      // 최종 매핑된 전체 데이터 출력
      console.log('최종 매핑된 전체 데이터:', mappedData);
      
      setInterviewData(mappedData);
      setError(null);
    } catch (err) {
      console.error('데이터 가져오기 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`데이터를 불러오는데 실패했습니다: ${errorMessage}`);
      setInterviewData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetchInterviewData();
  }, []);

  // 검색 필터링
  const filteredData = interviewData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone.includes(searchTerm)
  );

  // 정렬 함수
  const sortData = (data: InterviewData[]) => {
    return [...data].sort((a, b) => {
      if (sortField === 'createdate') {
        const dateA = new Date(a.createdate).getTime();
        const dateB = new Date(b.createdate).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      const valueA = a[sortField].toLowerCase();
      const valueB = b[sortField].toLowerCase();
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
  };

  // 정렬 토글 함수
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = sortData(filteredData);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 이력서 저장 핸들러
  const handleSaveResume = async (updatedHtml: string) => {
    try {
      const response = await fetch(process.env.REACT_APP_RESUME_SAVE_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_html: updatedHtml,
        })
      });
      if (!response.ok) {
        throw new Error('이력서 저장에 실패했습니다.');
      }
      // 필요 시 데이터 새로고침 처리
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('이력서 저장에 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* 검색 입력 필드 */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="이름 또는 연락처로 검색..."
              className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* 로딩 상태 및 에러 메시지 */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400 text-center py-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              {/* 데이터 테이블 */}
              <ResumeTable
                data={paginatedData}
                onRowClick={(item) => {
                  if (!item.resume_html || item.resume_html.trim() === '') {
                    setAlertMessage('이력서 정보가 없습니다.');
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 3000);
                    return;
                  }
                  setSelectedItem(item);
                  setShowResume(item.resume_html);
                }}
                onViewResume={(item, e) => {
                  e.stopPropagation();
                  if (!item.resume_html || item.resume_html.trim() === '') {
                    setAlertMessage('이력서 정보가 없습니다.');
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 3000);
                    return;
                  }
                  setSelectedItem(item);
                  setShowResume(item.resume_html);
                }}
              />
              {/* 페이지네이션 */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                onChangeItemsPerPage={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
              />
            </>
          )}
        </div>
      </motion.div>

      {/* 상세 정보 모달 */}
      {selectedItem && !showResume && (
        <DetailModal
          item={selectedItem}
          onClose={() => {
            setSelectedItem(null);
            setShowResume(null);
          }}
        />
      )}

      {/* 이력서 모달 */}
      {showResume && selectedItem && (
        <ResumeModal
          html={selectedItem.resume_html}
          id={selectedItem.id}
          name={selectedItem.name}
          onSaveSuccess={() => {
            fetchInterviewData();
          }}
          onClose={() => {
            setShowResume(null);
            setSelectedItem(null);
          }}
        />
      )}

      <AlertMessage message={alertMessage} show={showAlert} />
    </div>
  );
};

// AlertMessage 컴포넌트: 커스텀 알림 메시지를 표시합니다.
const AlertMessage = ({ message, show }: { message: string; show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
      >
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

// Pagination 컴포넌트: 페이지 네비게이션을 처리합니다.
const Pagination = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onChangeItemsPerPage,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onChangeItemsPerPage: (size: number) => void;
}) => (
  <div className="mt-4 flex justify-between items-center">
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">페이지당 항목:</span>
      <select
        onChange={(e) => onChangeItemsPerPage(Number(e.target.value))}
        className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
      >
        {[5, 10, 20, 50].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
    <div className="flex items-center space-x-2">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border dark:bg-gray-700 dark:text-white disabled:opacity-50"
      >
        이전
      </button>
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border dark:bg-gray-700 dark:text-white disabled:opacity-50"
      >
        다음
      </button>
    </div>
  </div>
);

// ResumeTable 컴포넌트: 이력서 데이터를 표로 렌더링하는 로직을 분리하여 UI 수정 및 확장이 용이합니다.
const ResumeTable = ({
  data,
  onRowClick,
  onViewResume,
}: {
  data: InterviewData[];
  onRowClick: (item: InterviewData) => void;
  onViewResume: (item: InterviewData, e: React.MouseEvent) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th className="w-1/6 px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            프로필 이미지
          </th>
          <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            이름
          </th>
          <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            연락처
          </th>
          <th className="w-1/4 px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            이력서
          </th>
          <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            생성일
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((item, index) => (
          <tr
            key={index}
            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            onClick={(e) => onRowClick(item)}
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
              {item.image ? (
                <img
                  src={item.image}
                  alt={`${item.name}의 프로필`}
                  className="w-12 h-12 rounded-full mx-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-profile.png';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
                  <span className="text-gray-500">No IMG</span>
                </div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {item.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {item.phone}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
              <button
                className="resume-button inline-flex items-center justify-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 min-w-[60px]"
                onClick={(e) => onViewResume(item, e)}
              >
                보기
              </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {new Date(item.createdate).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
); 