import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ActionButton } from './ActionButton';

export type ActionVariant = 'default' | 'outline' | 'ghost' | 'secondary';
export type ActionSize = 'sm' | 'md' | 'lg';

export interface QuickAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void | Promise<void>;
  variant?: ActionVariant;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  badge?: string | number;
  customComponent?: ReactNode;
}

interface QuickActionsProps {
  actions: QuickAction[];
  size?: ActionSize;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'grid' | 'list' | 'compact' | 'mobile';
  maxActions?: number;
  className?: string;
}

export function QuickActions({
  actions,
  size = 'md',
  orientation = 'horizontal',
  variant = 'list',
  maxActions,
  className
}: QuickActionsProps) {
  const visibleActions = maxActions ? actions.slice(0, maxActions) : actions;
  const hasOverflow = maxActions && actions.length > maxActions;
  const overflowCount = hasOverflow ? actions.length - maxActions : 0;

  const getContainerClasses = () => {
    switch (variant) {
      case 'grid':
        return 'grid grid-cols-2 gap-2';
      case 'mobile':
        return 'flex flex-col space-y-2';
      case 'compact':
        return 'flex gap-1';
      default:
        return cn(
          'flex gap-2',
          orientation === 'vertical' ? 'flex-col' : 'flex-row items-center'
        );
    }
  };

  const containerClasses = cn(getContainerClasses(), className);

  return (
    <div className={containerClasses}>
      {visibleActions.map((action) => (
        action.customComponent ? (
          <div key={action.id} className="flex-shrink-0">
            {action.customComponent}
          </div>
        ) : (
          <ActionButton
            key={action.id}
            size={size}
            variant={action.variant || 'outline'}
            onClick={action.onClick}
            disabled={action.disabled}
            loading={action.loading}
            tooltip={action.tooltip}
            badge={action.badge}
            icon={action.icon}
            className={cn(
              variant === 'mobile' && 'w-full justify-start',
              variant === 'compact' && 'px-2'
            )}
          >
            {variant !== 'compact' && action.label}
          </ActionButton>
        )
      ))}
      
      {hasOverflow && (
        <ActionButton
          size={size}
          variant="ghost"
          onClick={() => {}}
          tooltip={`Mais ${overflowCount} ações`}
        >
          +{overflowCount}
        </ActionButton>
      )}
    </div>
  );
}

// Pre-configured action sets for common use cases
export const createQuickAction = {
  view: (onView: () => void): QuickAction => ({
    id: 'view',
    label: 'Detalhes',
    onClick: onView,
    variant: 'outline' as ActionVariant
  }),
  
  chat: (onChat: () => void): QuickAction => ({
    id: 'chat',
    label: 'Assistente',
    onClick: onChat,
    variant: 'outline' as ActionVariant
  }),
  
  download: (onDownload: () => void, disabled = false): QuickAction => ({
    id: 'download',
    label: 'Download',
    onClick: onDownload,
    variant: 'default' as ActionVariant,
    disabled
  }),
  
  cancel: (onCancel: () => void, disabled = false): QuickAction => ({
    id: 'cancel',
    label: 'Cancelar',
    onClick: onCancel,
    variant: 'outline' as ActionVariant,
    disabled
  })
};