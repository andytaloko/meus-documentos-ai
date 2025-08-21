import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickReply {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface QuickRepliesProps {
  replies: QuickReply[];
  onReply: (value: string) => void;
  className?: string;
}

export function QuickReplies({ replies, onReply, className }: QuickRepliesProps) {
  if (replies.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 p-2", className)}>
      {replies.map((reply) => (
        <Button
          key={reply.id}
          variant="outline"
          size="sm"
          onClick={() => onReply(reply.value)}
          className="h-8 px-3 text-xs bg-secondary/20 border-border/40 hover:bg-secondary/40 transition-colors"
        >
          {reply.icon && <span className="mr-1">{reply.icon}</span>}
          {reply.label}
        </Button>
      ))}
    </div>
  );
}