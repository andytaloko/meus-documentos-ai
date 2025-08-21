import { useState, useEffect } from 'react';

export function useTypingIndicator() {
  const [isTyping, setIsTyping] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [isTyping]);

  return {
    isTyping,
    setIsTyping,
    dots,
  };
}