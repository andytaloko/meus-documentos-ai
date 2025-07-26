import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { useOrderStatus, OrderStatus } from '@/hooks/useOrderStatus';

interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<any>;
  estimatedDuration?: number; // in hours
}

interface ProgressTrackerProps {
  currentStatus: OrderStatus;
  steps?: ProgressStep[];
  showTimeline?: boolean;
  showEstimates?: boolean;
  showDescriptions?: boolean;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const defaultSteps: ProgressStep[] = [
  {
    id: 'created',
    label: 'Pedido Criado',
    description: 'Pedido registrado no sistema',
    estimatedDuration: 0
  },
  {
    id: 'paid',
    label: 'Pagamento Confirmado',
    description: 'Pagamento processado com sucesso',
    estimatedDuration: 1
  },
  {
    id: 'processing',
    label: 'Em Processamento',
    description: 'Documento sendo preparado',
    estimatedDuration: 24
  },
  {
    id: 'completed',
    label: 'Concluído',
    description: 'Documento pronto para download',
    estimatedDuration: 48
  }
];

export function ProgressTracker({
  currentStatus,
  steps = defaultSteps,
  showTimeline = true,
  showEstimates = false,
  showDescriptions = true,
  orientation = 'horizontal',
  size = 'md',
  className
}: ProgressTrackerProps) {
  const { progress, isCancelled } = useOrderStatus(currentStatus);
  
  const currentStepIndex = useMemo(() => {
    const statusOrder = ['created', 'paid', 'processing', 'completed'];
    return statusOrder.indexOf(currentStatus);
  }, [currentStatus]);

  const getStepStatus = (index: number) => {
    if (isCancelled) return 'cancelled';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: ProgressStep, index: number) => {
    const status = getStepStatus(index);
    const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    
    if (status === 'cancelled') {
      return <AlertCircle className={cn(iconSize, 'text-destructive')} />;
    }
    if (status === 'completed') {
      return <CheckCircle className={cn(iconSize, 'text-green-600')} />;
    }
    if (status === 'current') {
      return <Clock className={cn(iconSize, 'text-primary animate-pulse')} />;
    }
    
    return <Circle className={cn(iconSize, 'text-muted-foreground')} />;
  };

  const formatEstimate = (hours: number) => {
    if (hours === 0) return 'Imediato';
    if (hours < 1) return '< 1h';
    if (hours < 24) return `${hours}h`;
    const days = Math.round(hours / 24);
    return `${days}d`;
  };

  const containerClasses = cn(
    'w-full',
    orientation === 'vertical' ? 'flex flex-col' : 'flex flex-row items-center',
    className
  );

  const stepContainerClasses = cn(
    'flex',
    orientation === 'vertical' ? 'flex-col space-y-4' : 'flex-row items-center justify-between w-full'
  );

  return (
    <div className={containerClasses}>
      {/* Progress bar for horizontal layout */}
      {orientation === 'horizontal' && showTimeline && (
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-500 ease-out',
              isCancelled ? 'bg-destructive' : 'bg-primary'
            )}
            style={{ width: `${isCancelled ? 0 : progress}%` }}
          />
        </div>
      )}

      <div className={stepContainerClasses}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isActive = status === 'current';
          const isCompleted = status === 'completed';
          const isCancelledStep = status === 'cancelled';

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center',
                orientation === 'vertical' ? 'w-full' : 'flex-col text-center',
                size === 'sm' && 'space-y-1',
                size === 'lg' && 'space-y-3'
              )}
            >
              {/* Step icon and connector */}
              <div className={cn(
                'flex items-center',
                orientation === 'vertical' ? 'space-x-3' : 'flex-col'
              )}>
                <div className={cn(
                  'flex items-center justify-center rounded-full border-2 transition-all duration-300',
                  size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10',
                  isCompleted && 'border-green-500 bg-green-50',
                  isActive && 'border-primary bg-primary/10',
                  isCancelledStep && 'border-destructive bg-destructive/10',
                  !isCompleted && !isActive && !isCancelledStep && 'border-muted bg-background'
                )}>
                  {getStepIcon(step, index)}
                </div>

                {/* Vertical connector */}
                {orientation === 'vertical' && index < steps.length - 1 && (
                  <div className={cn(
                    'w-0.5 h-8 ml-4',
                    isCompleted ? 'bg-green-500' : 'bg-muted'
                  )} />
                )}
              </div>

              {/* Step content */}
              <div className={cn(
                'flex-1',
                orientation === 'horizontal' ? 'mt-2' : 'ml-3'
              )}>
                <h4 className={cn(
                  'font-medium transition-colors',
                  size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
                  isCompleted && 'text-green-700',
                  isActive && 'text-primary',
                  isCancelledStep && 'text-destructive',
                  !isCompleted && !isActive && !isCancelledStep && 'text-muted-foreground'
                )}>
                  {step.label}
                </h4>

                {showDescriptions && step.description && (
                  <p className={cn(
                    'text-muted-foreground mt-1',
                    size === 'sm' ? 'text-xs' : 'text-sm'
                  )}>
                    {step.description}
                  </p>
                )}

                {showEstimates && step.estimatedDuration !== undefined && (
                  <span className={cn(
                    'inline-block mt-1 px-2 py-1 bg-muted text-muted-foreground rounded text-xs',
                    isActive && 'bg-primary/10 text-primary'
                  )}>
                    {formatEstimate(step.estimatedDuration)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simplified progress tracker for compact layouts
export function CompactProgressTracker({
  currentStatus,
  className
}: {
  currentStatus: OrderStatus;
  className?: string;
}) {
  const { progress, label, isCancelled } = useOrderStatus(currentStatus);

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all duration-500',
            isCancelled ? 'bg-destructive' : 'bg-primary'
          )}
          style={{ width: `${isCancelled ? 0 : progress}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground min-w-0">
        {label}
      </span>
    </div>
  );
}