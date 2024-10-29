import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { saveInterviewResult } from '../services/firebase';

interface InterviewResultProps {
  phoneNumber: string;
  answers: Array<{
    question: string;
    answer: string;
  }>;
  onClose: () => void;
}

export const InterviewResult = ({ phoneNumber, answers, onClose }: InterviewResultProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await saveInterviewResult({
        phoneNumber,
        answers
      });
      onClose();
    } catch (err) {
      setError('결과 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            면접 결과
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {phoneNumber}
          </p>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {answers.map((item, index) => (
            <div key={index} className="mb-8 last:mb-0">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Q{index + 1}. {item.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            닫기
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className={`
              px-6 py-2 rounded-lg font-medium
              ${isSaving
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'}
            `}
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>저장 중...</span>
              </div>
            ) : (
              '결과 저장'
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 bg-red-100 text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}; 