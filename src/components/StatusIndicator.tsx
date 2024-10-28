import { motion } from 'framer-motion';

interface StatusIndicatorProps {
  isListening: boolean;
}

export const StatusIndicator = ({ isListening }: StatusIndicatorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center space-x-2"
    >
      <motion.div
        animate={{
          scale: isListening ? [1, 1.2, 1] : 1,
          backgroundColor: isListening ? '#10B981' : '#6B7280',
        }}
        transition={{
          repeat: isListening ? Infinity : 0,
          duration: 1.5,
        }}
        className="w-3 h-3 rounded-full"
      />
      <span className={`text-sm ${isListening ? 'text-green-500' : 'text-gray-500'}`}>
        {isListening ? '음성 인식 중...' : '대기 중'}
      </span>
    </motion.div>
  );
};
