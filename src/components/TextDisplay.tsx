import { motion } from 'framer-motion';

interface TextDisplayProps {
  text: string;
}

export const TextDisplay = ({ text }: TextDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">
            인식된 텍스트
          </h2>
        </div>
        <div className="p-6">
          {text ? (
            <p className="text-gray-700 dark:text-gray-200 text-lg whitespace-pre-wrap">
              {text}
            </p>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 dark:text-gray-500 text-lg italic">
                마이크 버튼을 누르고 말씀해주세요
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                음성이 인식되면 이곳에 텍스트로 변환되어 표시됩니다
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
