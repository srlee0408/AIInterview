import { motion, AnimatePresence } from 'framer-motion';

interface TextDisplayProps {
  text: string;
}

export const TextDisplay = ({ text }: TextDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
        <div className="p-3 md:p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
          <h2 className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-200">
            인식된 텍스트
          </h2>
          <motion.div
            animate={{
              scale: text ? [1, 1.2, 1] : 1,
              opacity: text ? 1 : 0.5,
            }}
            transition={{ duration: 0.5 }}
            className="h-2 w-2 rounded-full bg-green-500"
          />
        </div>
        <div className="p-4 md:p-6 max-h-[30vh] md:max-h-[40vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {text ? (
              <motion.p
                key="text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-gray-700 dark:text-gray-200 text-base md:text-lg whitespace-pre-wrap leading-relaxed"
              >
                {text}
              </motion.p>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-6 md:py-8"
              >
                <p className="text-gray-400 dark:text-gray-500 text-base md:text-lg italic">
                  마이크 버튼을 눌러 음성 인식을 시작하세요
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm mt-2">
                  말씀하신 내용이 이곳에 실시간으로 표시됩니다
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
