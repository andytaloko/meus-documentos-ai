import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActionVariant = 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
export type ActionSize = 'sm' | 'md' | 'lg';
export type ActionState = 'idle' | 'loading' | 'success' | 'error';

interface ActionButtonProps {
  children?: ReactNode;
  icon?: ReactNode;
  onClick: () => void | Promise<void>;
  variant?: ActionVariant;
  size?: ActionSize;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  badge?: string | number;
  compact?: boolean;
  className?: string;
  autoFeedback?: boolean; // Auto show success/error feedback
}

export function ActionButton({
  children,
  icon,
  onClick,
  variant = 'outline',
  size = 'md',
  disabled = false,
  loading = false,
  tooltip,
  badge,
  compact = false,
  className,
  autoFeedback = true
}: ActionButtonProps) {
  const [state, setState] = useState<ActionState>('idle');

  const handleClick = async () => {
    if (disabled || state === 'loading') return;

    setState('loading');
    
    try {
      const result = onClick();
      if (result instanceof Promise) {
        await result;
      }
      
      if (autoFeedback) {
        setState('success');
        setTimeout(() => setState('idle'), 1500);
      } else {
        setState('idle');
      }
    } catch (error) {
      console.error('Action failed:', error);
      if (autoFeedback) {
        setState('error');
        setTimeout(() => setState('idle'), 2000);
      } else {
        setState('idle');
      }
    }
  };

  const isLoading = loading || state === 'loading';
  const isSuccess = state === 'success';
  const isError = state === 'error';

  const getButtonIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (isSuccess) return <Check className="w-4 h-4 text-green-600" />;
    if (isError) return <X className="w-4 h-4 text-destructive" />;
    return icon;
  };

  const buttonContent = (
    <div className="relative">
      <Button
        variant={variant}
        size={size === 'md' ? 'default' : size as any}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={cn(
          'relative transition-all duration-200',
          compact && 'px-2',
          isSuccess && 'border-green-500 bg-green-50 hover:bg-green-100',
          isError && 'border-destructive bg-destructive/10',
          className
        )}
      >
        <div className="flex items-center gap-2">
          {getButtonIcon()}
          {children && !compact && (
            <span className={cn(
              'transition-opacity duration-200',
              (isLoading || isSuccess || isError) && 'opacity-70'
            )}>
              {children}
            </span>
          )}
        </div>
      </Button>
      
      {/* Badge indicator */}
      {badge && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {typeof badge === 'number' && badge > 9 ? '9+' : badge}
        </Badge>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}