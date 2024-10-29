import { motion } from 'framer-motion';

interface NumPadProps {
  onNumberClick: (number: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const NumPad = ({ onNumberClick, onDelete, onSubmit, disabled }: NumPadProps) => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0'];

  const handleClick = (value: string) => {
    if (value === '←') {
      onDelete();
    } else if (!disabled) {
      onNumberClick(value);
      // 햅틱 피드백
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-sm mx-auto">
      {numbers.map((num) => (
        <motion.button
          key={num}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            aspect-square rounded-2xl text-2xl font-medium
            ${num === '←'
              ? 'bg-red-500/80 text-white'
              : disabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white/80 text-gray-800 dark:bg-gray-800/80 dark:text-white shadow-lg hover:shadow-xl'}
            backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50
            transition-all duration-200
          `}
          onClick={() => handleClick(num)}
          disabled={disabled && num !== '←'}
        >
          {num}
        </motion.button>
      ))}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          aspect-square rounded-2xl text-xl font-medium
          ${disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-green-500/80 text-white shadow-lg hover:shadow-xl'}
          backdrop-blur-sm
        `}
        onClick={onSubmit}
        disabled={disabled}
      >
        확인
      </motion.button>
    </div>
  );
};