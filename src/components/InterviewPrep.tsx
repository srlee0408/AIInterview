import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface InterviewPrepProps {
  onStart: () => void;
}

export const InterviewPrep = ({ onStart }: InterviewPrepProps) => {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const prepItems = [
    {
      title: '카메라와 마이크 확인',
      description: '카메라와 마이크가 정상적으로 작동하는지 확인해주세요.',
      icon: '🎥',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      title: '조용한 환경',
      description: '조용한 환경에서 면접을 진행해주세요.',
      icon: '🔇',
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      title: '카메라 위치',
      description: '얼굴이 잘 보이도록 카메라를 조정해주세요.',
      icon: '📸',
      color: 'from-indigo-500/20 to-indigo-600/20'
    },
    {
      title: '면접 시작',
      description: '면접 시작 후에는 중단할 수 없습니다.',
      icon: '⚠️',
      color: 'from-red-500/20 to-red-600/20'
    }
  ];

  const handleCheck = (index: number) => {
    if (checkedItems.includes(index)) {
      setCheckedItems(prev => prev.filter(i => i !== index));
    } else {
      setCheckedItems(prev => [...prev, index]);
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
  };

  const allChecked = checkedItems.length === prepItems.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full min-h-[100dvh] flex flex-col justify-center px-4 py-6 md:py-12"
    >
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          면접 준비하기
        </h2>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          면접 시작 전 아래 항목들을 확인해주세요
        </p>
        
        <div className="space-y-3 md:space-y-4 mb-6">
          {prepItems.map((item, index) => (
            <motion.div
              key={index}
              className={`
                relative overflow-hidden
                flex items-start space-x-3 p-3 md:p-4 rounded-lg
                bg-gradient-to-r ${item.color}
                backdrop-blur-sm cursor-pointer
                border border-gray-200/30 dark:border-gray-700/30
                active:scale-[0.98] transition-transform duration-200
              `}
              onClick={() => handleCheck(index)}
            >
              <div className="flex-shrink-0 text-xl md:text-2xl">{item.icon}</div>
              <div className="flex-grow min-w-0">
                <h3 className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200 truncate">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div
                className={`
                  w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0
                  ${checkedItems.includes(index)
                    ? 'bg-green-500'
                    : 'bg-white/50 dark:bg-gray-700/50'}
                  transition-colors duration-200
                `}
              >
                {checkedItems.includes(index) && (
                  <CheckIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: allChecked ? 1.02 : 1 }}
          whileTap={{ scale: allChecked ? 0.98 : 1 }}
          onClick={onStart}
          disabled={!allChecked}
          className={`
            w-full py-3 md:py-4 rounded-lg font-medium text-center text-sm md:text-base
            transition-all duration-200
            ${allChecked
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
        >
          {allChecked ? '면접 시작하기' : '모든 항목을 확인해주세요'}
        </motion.button>

        <AnimatePresence>
          {!allChecked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center justify-center space-x-2"
            >
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {`${checkedItems.length}/${prepItems.length} 항목 확인됨`}
              </span>
              <div className="w-24 md:w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  animate={{
                    width: `${(checkedItems.length / prepItems.length) * 100}%`
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};