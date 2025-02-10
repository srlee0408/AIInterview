import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 면접자 정보 인터페이스 수정
interface InterviewData {
  name: string;
  phone: string;
  birth: string;
  resumer_history: string;
  summary: string;
  evaluation: string;
  resume_html: string;
  createdate: string;
}

// 정렬 방향 타입 정의
type SortDirection = 'asc' | 'desc';

// 정렬 필드 타입 정의
type SortField = 'name' | 'phone' | 'createdate';

// 마크다운 텍스트를 순수 텍스트로 변환하는 함수 추가
const convertMarkdownToText = (markdown: string) => {
  return markdown
    .replace(/#{1,6}\s/g, '') // 헤더 제거
    .replace(/\*\*/g, '') // 볼드체 제거
    .replace(/\*/g, '') // 이탤릭체 제거
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // 링크 제거
    .replace(/\n\s*[-*+]\s/g, '\n• ') // 리스트를 bullet point로 변환
    .replace(/---/g, '') // 구분선 제거
    .replace(/\n{3,}/g, '\n\n') // 3개 이상의 연속된 줄바꿈을 2개로 통일
    .trim(); // 앞뒤 공백 제거
};

// 메인 컴포넌트 수정
export const Resume = () => {
  const [interviewData, setInterviewData] = useState<InterviewData[]>([]);
  const [selectedItem, setSelectedItem] = useState<InterviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // 데이터 가져오기
  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        const response = await fetch('https://hook.eu2.make.com/4rjf4qre448qj5n6osderninkbg9jqv9', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
        
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        
        try {
          // 데이터가 배열인지 확인
          if (!Array.isArray(data)) {
            console.error('Invalid data structure:', data);
            setInterviewData([]);
            return;
          }

          // 데이터 매핑
          const mappedData = data.map((item: any) => ({
            name: item.name || '',
            phone: item.phone || '',
            birth: item.birth || '',
            resumer_history: item.resumer_history || '',
            summary: item.summary || '',
            evaluation: item.evaluation || '',
            resume_html: item.resume_html || '',
            createdate: item.createdate || ''
          }));

          setInterviewData(mappedData);
        } catch (err) {
          console.error('Error processing data:', err, data);
          setInterviewData([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewData();
  }, []);

  // 검색 필터링 수정
  const filteredData = interviewData?.filter(item => 
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (item.phone?.includes(searchTerm) || false)
  ) || [];

  // 정렬 함수
  const sortData = (data: InterviewData[]) => {
    return [...data].sort((a, b) => {
      if (sortField === 'createdate') {
        const dateA = new Date(a[sortField]).getTime();
        const dateB = new Date(b[sortField]).getTime();
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

  // 페이지네이션 처리
  const sortedData = sortData(filteredData);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
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

          {/* 로딩 상태 표시 */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          )}

          {/* 에러 메시지 표시 */}
          {error && (
            <div className="text-red-500 text-center py-4">
              {error}
            </div>
          )}

          {/* 데이터 테이블 */}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-white"
                        onClick={() => toggleSort('name')}
                      >
                        <span>이름</span>
                        {sortField === 'name' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-white"
                        onClick={() => toggleSort('phone')}
                      >
                        <span>연락처</span>
                        {sortField === 'phone' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-white"
                        onClick={() => toggleSort('createdate')}
                      >
                        <span>생성일</span>
                        {sortField === 'createdate' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.map((item, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(item.createdate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이지 크기 선택 및 페이지네이션 컨트롤 추가 */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">페이지당 항목:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
              >
                {[5, 10, 20, 50].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                이전
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 상세 정보 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* 헤더 영역 */}
            <div className="flex justify-between items-center pb-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedItem.name}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            {/* 기본 정보 영역 */}
            <div className="grid grid-cols-3 gap-4 py-6 border-b dark:border-gray-700">
              <div className="text-gray-900 dark:text-white">
                <p className="text-sm text-gray-500 dark:text-gray-400">연락처</p>
                <p className="font-medium">{selectedItem.phone}</p>
              </div>
              <div className="text-gray-900 dark:text-white">
                <p className="text-sm text-gray-500 dark:text-gray-400">생년월일</p>
                <p className="font-medium">{selectedItem.birth}</p>
              </div>
              <div className="text-gray-900 dark:text-white">
                <p className="text-sm text-gray-500 dark:text-gray-400">생성일</p>
                <p className="font-medium">{new Date(selectedItem.createdate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* 상세 정보 영역 */}
            <div className="space-y-6 pt-6 text-gray-900 dark:text-white">
              {/* AI 요약 섹션 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI 요약</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {convertMarkdownToText(selectedItem.summary)}
                  </p>
                </div>
              </div>

              {/* AI 평가 섹션 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI 평가</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {convertMarkdownToText(selectedItem.evaluation)}
                  </p>
                </div>
              </div>

              {/* 면접 내용 섹션 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">면접 내용</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                    {selectedItem.resumer_history}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}; 