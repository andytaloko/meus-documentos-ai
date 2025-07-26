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
}

interface QuickActionsProps {
  actions: QuickAction[];
  size?: ActionSize;
  orientation?: 'horizontal' | 'vertical';
  maxActions?: number;
  className?: string;
  compact?: boolean;
}

export function QuickActions({
  actions,
  size = 'md',
  orientation = 'horizontal',
  maxActions,
  className,
  compact = false
}: QuickActionsProps) {
  const visibleActions = maxActions ? actions.slice(0, maxActions) : actions;
  const hasOverflow = maxActions && actions.length > maxActions;
  const overflowCount = hasOverflow ? actions.length - maxActions : 0;

  const containerClasses = cn(
    'flex gap-2',
    orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
    compact && 'gap-1',
    className
  );

  return (
    <div className={containerClasses}>
      {visibleActions.map((action) => (
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
          compact={compact}
        >
          {!compact && action.label}
        </ActionButton>
      ))}
      
      {hasOverflow && (
        <ActionButton
          size={size}
          variant="ghost"
          onClick={() => {}}
          tooltip={`Mais ${overflowCount} ações`}
          compact={compact}
        >
          +{overflowCount}
        </ActionButton>
      )}
    </div>
  );
}

// Pre-configured action sets for common use cases
export const orderActions = {
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