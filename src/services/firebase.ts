import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD-Cc2GRbMSNJuFdTMwBio3p8QwdbGaDgg",
  authDomain: "aispeak-f73a6.firebaseapp.com",
  projectId: "aispeak-f73a6",
  storageBucket: "aispeak-f73a6.appspot.com",
  messagingSenderId: "666072176448",
  appId: "1:666072176448:web:f64975a7a387e19a6ecca5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

interface InterviewResult {
  phoneNumber: string;
  answers: Array<{
    question: string;
    answer: string;
  }>;
  createdAt: Date;
}

export const saveInterviewResult = async (result: Omit<InterviewResult, 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'interviews'), {
      ...result,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving interview result:', error);
    throw error;
  }
};

export const uploadInterviewVideo = async (
  videoBlob: Blob,
  phoneNumber: string
): Promise<string> => {
  try {
    // Blob을 File 객체로 변환
    const file = new File([videoBlob], `interview_${Date.now()}.webm`, {
      type: 'video/webm'
    });

    const fileName = `interviews/${phoneNumber}/${Date.now()}.webm`;
    const storageRef = ref(storage, fileName);
    
    // 메타데이터 설정
    const metadata = {
      contentType: 'video/webm',
      customMetadata: {
        phoneNumber: phoneNumber,
        timestamp: Date.now().toString()
      }
    };

    console.log('Starting video upload:', {
      fileName,
      size: file.size,
      type: file.type
    });
    
    // 업로드 시도
    try {
      await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Video uploaded successfully:', downloadURL);
      return downloadURL;
    } catch (uploadError) {
      console.error('Upload error details:', {
        error: uploadError,
        fileName,
        metadata
      });
      throw new Error('영상 업로드 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('Error in uploadInterviewVideo:', error);
    // 에러를 throw하지 않고 빈 문자열 반환
    return '';
  }
};

export default app; 