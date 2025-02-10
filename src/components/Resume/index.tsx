import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        // resume_html이 null이 아닐 때만 이미지 교체 수행
        const resume_html_with_image = item.resume_html 
          ? item.resume_html.replace(
              // alt="Profile"을 가진 이미지 태그를 찾아서 교체
              /<img[^>]*alt="Profile"[^>]*>/gi,
              `<img src="${item.image || ''}" alt="Profile" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover;">`
            )
          : '';

        // 각 항목별 매핑된 데이터도 콘솔에 출력
        console.log('매핑된 개별 데이터:', {
          id: item.ID || '',
          name: item.name || '',
          phone: item.phone || '',
          birth: item.birth || '',
          resumer_history: item.resumer_history || '',
          summary: item.summary || '',
          evaluation: item.evaluation || '',
          resume_html_with_image,
          createdate: item.createdate || '',
          image: item.image || ''
        });

        return {
          id: item.ID || '',
          name: item.name || '',
          phone: item.phone || '',
          birth: item.birth || '',
          resumer_history: item.resumer_history || '',
          summary: item.summary || '',
          evaluation: item.evaluation || '',
          resume_html: item.resume_html || '', // 원본 HTML 유지
          resume_html_with_image, // 이미지가 포함된 HTML 저장
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
          {/* 로딩 상태 표시 */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
            </div>
          )}
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="text-red-500 dark:text-red-400 text-center py-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
              {error}
            </div>
          )}
          {/* 데이터 테이블 */}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="w-1/6 px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      프로필 이미지
                    </th>
                    <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                    <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                    <th className="w-1/4 px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      이력서
                    </th>
                    <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                      onClick={(e) => {
                        if (!(e.target as HTMLElement).closest('.resume-button')) {
                          setSelectedItem(item);
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={`${item.name}의 프로필`}
                            className="w-12 h-12 rounded-full mx-auto object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/default-profile.png'; // 기본 이미지 경로
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setShowResume(item.resume_html_with_image); // 이미지가 포함된 HTML 사용
                          }}
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
          )}
          {/* 페이지네이션 컨트롤 */}
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
          html={showResume} // 이미지가 포함된 HTML 전달
          id={selectedItem.id}
          onSaveSuccess={() => {
            fetchInterviewData();
          }}
          onClose={() => {
            setShowResume(null);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}; 