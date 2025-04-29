import { motion } from 'framer-motion';

interface MessageBubbleProps {
  role: 'user' | 'nova';
  content: string;
}

export const MessageBubble = ({ role, content }: MessageBubbleProps) => {
  return (
    <motion.div
      className={`message-bubble ${role}`}
      initial={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  );
};
