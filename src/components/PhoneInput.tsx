import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { NumPad } from './NumPad';
import { submitPhoneNumber } from '../services/webhook';

interface PhoneInputProps {
  onSubmit: (phoneNumber: string) => void;
}

export const PhoneInput = ({ onSubmit }: PhoneInputProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNumberClick = (number: string) => {
    if (phoneNumber.length < 11) {
      setPhoneNumber(prev => prev + number);
      setError('');
    }
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
    setError('');
  };

  const formatPhoneNumber = (number: string) => {
    if (number.length <= 3) return number;
    if (number.length <= 7) return `${number.slice(0, 3)}-${number.slice(3)}`;
    return `${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7)}`;
  };

  const handleSubmit = async () => {
    if (phoneNumber.length !== 11) {
      setError('올바른 전화번호를 입력해주세요');
      return;
    }

    try {
      setIsLoading(true);
      await submitPhoneNumber(phoneNumber);
      setIsLoading(false);
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        onSubmit(phoneNumber);
      }, 2000);
    } catch (err) {
      setIsLoading(false);
      setError('전화번호 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-[100dvh] flex flex-col justify-center px-4 md:px-6"
    >
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          AI 면접 시작하기
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 md:mb-8">

        </p>
        
        <div className="space-y-6 md:space-y-8">
          {/* 전화번호 표시 영역 */}
          <div className="relative">
            <div className="w-full px-3 py-2 md:px-4 md:py-3 text-center text-xl md:text-2xl font-medium text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {formatPhoneNumber(phoneNumber) || '면접 결과를 받으실 전화번호를 입력해주세요.'}
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -bottom-6 left-0 w-full text-center text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* 숫자 키패드 */}
          <NumPad
            onNumberClick={handleNumberClick}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            disabled={phoneNumber.length > 11}
          />
        </div>

        <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg md:text-xl">🔒</span>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              개인정보는 안전하게 보호됩니다
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] md:text-xs text-center text-gray-400"
          >
            입력하신 전화번호는 면접 결과 전송에만 사용됩니다
          </motion.div>
        </div>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-blue-500/20 max-w-[90%] mx-4">
                <div className="flex flex-col items-center space-y-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12"
                  >
                    <svg className="w-full h-full text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4.75V6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17.1266 6.87347L16.0659 7.93413" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.25 12L17.75 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17.1266 17.1265L16.0659 16.0659" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 19.25V17.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7.9342 16.0659L6.87354 17.1265" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.25 12L4.75 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7.9342 7.93413L6.87354 6.87347" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    전화번호 등록 중...
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    잠시만 기다려주세요
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {showSuccessPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-green-500/20 max-w-[90%] mx-4">
                <div className="flex flex-col items-center space-y-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    전화번호가 등록되었습니다
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    면접을 시작합니다...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};