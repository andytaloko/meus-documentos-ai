import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useOrderStatus, OrderStatus } from '@/hooks/useOrderStatus';

interface StatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  showProgress?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({
  status,
  showIcon = true,
  showProgress = false,
  animated = true,
  size = 'md',
  className
}: StatusBadgeProps) {
  const {
    label,
    variant,
    color,
    icon: Icon,
    progress,
    isCompleted,
    isCancelled
  } = useOrderStatus(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className="relative inline-flex items-center">
      <Badge
        variant={variant}
        className={cn(
          'transition-all duration-300 flex items-center gap-1.5',
          sizeClasses[size],
          animated && 'animate-fade-in',
          isCompleted && 'bg-green-100 text-green-800 border-green-300',
          isCancelled && 'bg-red-100 text-red-800 border-red-300',
          className
        )}
      >
        {showIcon && Icon && (
          <Icon 
            className={cn(
              'w-3 h-3',
              size === 'lg' && 'w-4 h-4',
              animated && isCompleted && 'animate-pulse'
            )} 
          />
        )}
        <span className="font-medium">{label}</span>
        {showProgress && (
          <span className="text-xs opacity-75 ml-1">
            ({progress}%)
          </span>
        )}
      </Badge>
      
      {/* Pulse effect for active statuses */}
      {animated && !isCompleted && !isCancelled && (
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary" />
      )}
    </div>
  );
}

// Specialized status badges for different contexts
export function PaymentStatusBadge({ 
  status, 
  className 
}: { 
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  className?: string;
}) {
  const config = {
    pending: {
      label: 'Pendente',
      variant: 'outline' as const,
      color: 'text-yellow-600'
    },
    paid: {
      label: 'Pago',
      variant: 'default' as const,
      color: 'text-green-600'
    },
    failed: {
      label: 'Falhou',
      variant: 'destructive' as const,
      color: 'text-red-600'
    },
    refunded: {
      label: 'Reembolsado',
      variant: 'secondary' as const,
      color: 'text-blue-600'
    }
  };

  const { label, variant, color } = config[status];

  return (
    <Badge
      variant={variant}
      className={cn('text-xs', color, className)}
    >
      {label}
    </Badge>
  );
}

export function PriorityBadge({ 
  priority, 
  className 
}: { 
  priority: 'low' | 'normal' | 'high' | 'urgent';
  className?: string;
}) {
  const config = {
    low: {
      label: 'Baixa',
      variant: 'outline' as const,
      color: 'text-gray-600'
    },
    normal: {
      label: 'Normal',
      variant: 'secondary' as const,
      color: 'text-blue-600'
    },
    high: {
      label: 'Alta',
      variant: 'default' as const,
      color: 'text-orange-600'
    },
    urgent: {
      label: 'Urgente',
      variant: 'destructive' as const,
      color: 'text-red-600'
    }
  };

  const { label, variant } = config[priority];

  return (
    <Badge
      variant={variant}
      className={cn('text-xs animate-pulse', className)}
    >
      {label}
    </Badge>
  );
}