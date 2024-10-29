const PHONE_WEBHOOK_URL = process.env.REACT_APP_PHONE_WEBHOOK_URL;
const INTERVIEW_HISTORY_WEBHOOK_URL = process.env.REACT_APP_INTERVIEW_HISTORY_WEBHOOK_URL;

if (!PHONE_WEBHOOK_URL || !INTERVIEW_HISTORY_WEBHOOK_URL) {
  throw new Error('Required webhook URLs are not defined');
}

interface PhoneSubmitData {
  phone: string;
  time: number;
}

interface InterviewHistoryData {
  phoneNumber: string;
  history: string;
  timestamp: number;
}

export const submitPhoneNumber = async (phoneNumber: string): Promise<void> => {
  try {
    const data: PhoneSubmitData = {
      phone: phoneNumber,
      time: Date.now()
    };

    console.log('전화번호 전송 시작:', {
      url: PHONE_WEBHOOK_URL,
      data: JSON.stringify(data, null, 2) // JSON을 보기 좋게 포맷팅
    });

    const response = await fetch(PHONE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data), // 데이터를 JSON 문자열로 변환
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('웹훅 요청 완료:', {
      status: response.status,
      data: JSON.stringify(responseData, null, 2) // 응답 데이터를 보기 좋게 포맷팅
    });

  } catch (error) {
    console.error('전화번호 전송 중 오류 발생:', error);
    if (error instanceof Error) {
      console.error('에러 상세:', {
        message: error.message,
        stack: error.stack
      });
    }
  }
};

export const submitInterviewHistory = async (
  phoneNumber: string,
  answers: Array<{question: string; answer: string}>
): Promise<void> => {
  try {
    const history = answers.reduce((acc, curr, index) => {
      if (index === 0) {
        return `면접관: ${curr.question}\n지원자: ${curr.answer}`;
      }
      return `${acc}\n면접관: ${curr.question}\n지원자: ${curr.answer}`;
    }, '');

    const data: InterviewHistoryData = {
      phoneNumber,
      history,
      timestamp: Date.now()
    };

    console.log('면접 기록 전송 시작:', {
      url: INTERVIEW_HISTORY_WEBHOOK_URL,
      data: JSON.stringify(data, null, 2)
    });

    const response = await fetch(INTERVIEW_HISTORY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('면접 기록 전송 완료:', {
      status: response.status
    });

  } catch (error) {
    console.error('면접 기록 전송 중 오류 발생:', error);
    if (error instanceof Error) {
      console.error('에러 상세:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};