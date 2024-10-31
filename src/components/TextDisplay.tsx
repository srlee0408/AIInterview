import { motion, AnimatePresence } from 'framer-motion';

interface TextDisplayProps {
  text: string;
}

export const TextDisplay = ({ text }: TextDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm overflow-hidden">
        <div className="p-2 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200 w-full text-center">
            답변 내용
          </h2>
          <motion.div
            animate={{
              scale: text ? [1, 1.2, 1] : 1,
              opacity: text ? 1 : 0.5,
            }}
            transition={{ duration: 0.5 }}
            className="h-1.5 w-1.5 rounded-full bg-green-500"
          />
        </div>
        <div className="p-3 max-h-[15vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {text ? (
              <motion.p
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-gray-700 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed"
              >
                {text}
              </motion.p>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-2"
              >
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
