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
      await submitPhoneNumber(phoneNumber);
      onSubmit(phoneNumber);
    } catch (err) {
      setError('전화번호 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto p-4 md:p-6"
    >
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          AI 면접 시작하기
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">
          면접 결과를 받으실 전화번호를 입력해주세요
        </p>
        
        <div className="space-y-8">
          {/* 전화번호 표시 영역 */}
          <div className="relative">
            <div className="w-full px-4 py-3 text-center text-2xl font-medium text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {formatPhoneNumber(phoneNumber) || '010-0000-0000'}
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

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl">🔒</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              개인정보는 안전하게 보호됩니다
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-center text-gray-400"
          >
            입력하신 전화번호는 면접 결과 전송에만 사용됩니다
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};