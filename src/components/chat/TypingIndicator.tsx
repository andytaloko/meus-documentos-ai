import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  visible: boolean;
  className?: string;
}

export function TypingIndicator({ visible, className }: TypingIndicatorProps) {
  const { dots } = useTypingIndicator();

  if (!visible) return null;

  return (
    <div className={cn("flex items-start gap-3 p-4", className)}>
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-secondary/50 rounded-lg p-3 max-w-xs">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-sm">Digitando</span>
            <span className="text-primary font-bold w-6">{dots}</span>
          </div>
        </div>
      </div>
    </div>
  );
}