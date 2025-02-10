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

// 연락처 포맷팅 함수 추가
const formatPhoneNumber = (phone: string) => {
  // 숫자만 추출
  const numbers = phone.replace(/[^0-9]/g, '');
  
  // 길이에 따른 포맷팅
  if (numbers.length === 11) {
    // 010-1234-5678 형식
    return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (numbers.length === 10) {
    // 02-123-4567 형식
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
  } else {
    // 그 외의 경우 원본 반환
    return phone;
  }
};

// 이력서 데이터 인터페이스 추가
interface ResumeFormData {
  profileImage: string;
  name: string;
  position: string;
  basicInfo: {
    성명: string;
    희망근무형태: string;
    근무가능시간: string;
    희망급여: string;
    입사가능일: string;
    운전면허: string;
    자차운행: string;
    급여수령: string;
    거주지: string;
    연락처: string;
    이메일: string;
  };
  scores: {
    근속: { score: number; reason: string };
    근태: { score: number; reason: string };
    수용성: { score: number; reason: string };
    체력: { score: number; reason: string };
    배송업적합성: { score: number; reason: string };
    디지털기기사용능력: { score: number; reason: string };
  };
  experience: string[];
  evaluation: {
    totalScore: number;
    status: string;
    recommendations: string[];
    concerns: string[];
    specialNotes: string[];
  };
}

// HTML을 데이터 객체로 파싱하는 함수
const parseHtmlToData = (html: string): ResumeFormData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // 여기서 HTML에서 필요한 데이터를 추출하여 ResumeFormData 객체로 변환
  // ... 구현 필요
  
  return {
    profileImage: '',
    name: '',
    position: '',
    basicInfo: {
      성명: '',
      희망근무형태: '',
      근무가능시간: '',
      희망급여: '',
      입사가능일: '',
      운전면허: '',
      자차운행: '',
      급여수령: '',
      거주지: '',
      연락처: '',
      이메일: ''
    },
    scores: {
      근속: { score: 0, reason: '' },
      근태: { score: 0, reason: '' },
      수용성: { score: 0, reason: '' },
      체력: { score: 0, reason: '' },
      배송업적합성: { score: 0, reason: '' },
      디지털기기사용능력: { score: 0, reason: '' }
    },
    experience: [],
    evaluation: {
      totalScore: 0,
      status: '',
      recommendations: [],
      concerns: [],
      specialNotes: []
    }
  };
};

// 데이터를 HTML로 변환하는 함수
const convertDataToHtml = (data: ResumeFormData): string => {
  // ResumeFormData를 HTML 문자열로 변환
  // ... 구현 필요
  return '';
};

// 이력서 모달 컴포넌트 수정
const ResumeModal = ({ 
  html, 
  onClose,
  onSave
}: { 
  html: string; 
  onClose: () => void;
  onSave?: (updatedHtml: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");

  // contentEditable ref 추가
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (onSave && contentRef.current) {
      const updatedHtml = contentRef.current.innerHTML;
      await onSave(updatedHtml);
      setIsEditing(false);
    }
  };

  // 이미지 업로드 처리
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

        {isEditing && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium mb-2">수정 도움말</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-4">
              <li>텍스트를 직접 클릭하여 수정할 수 있습니다.</li>
              <li>이미지 변경 버튼을 클릭하여 프로필 이미지를 변경할 수 있습니다.</li>
              <li>수정이 완료되면 저장 버튼을 클릭하세요.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// 상세 정보 모달 컴포넌트 추가
const DetailModal = ({ 
  item,
  onClose 
}: { 
  item: InterviewData;
  onClose: () => void;
}) => {
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
  const [showResume, setShowResume] = useState<string | null>(null);

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

  const handleSaveResume = async (updatedHtml: string) => {
    try {
      // API 엔드포인트로 업데이트된 HTML 전송
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_html: updatedHtml,
          // 필요한 다른 데이터도 포함
        })
      });

      if (!response.ok) {
        throw new Error('이력서 저장에 실패했습니다.');
      }

      // 성공 시 데이터 새로고침
      // fetchInterviewData(); // 데이터 새로고침 함수 호출
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('이력서 저장에 실패했습니다.');
    }
  };

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
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatPhoneNumber(item.phone)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // 행 클릭 이벤트 전파 방지
                            setShowResume(item.resume_html);
                          }}
                          className="inline-flex items-center justify-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 min-w-[60px]"
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
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* 이력서 모달 */}
      {showResume && (
        <ResumeModal
          html={showResume}
          onClose={() => setShowResume(null)}
          onSave={handleSaveResume}
        />
      )}
    </div>
  );
}; 