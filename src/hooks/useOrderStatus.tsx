import { useMemo } from 'react';
import { FileText, CreditCard, Clock, Truck, AlertCircle } from 'lucide-react';

export type OrderStatus = 'created' | 'paid' | 'processing' | 'completed' | 'cancelled';

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
  progress: number;
  icon: React.ComponentType<any>;
  description: string;
}

const statusConfigMap: Record<OrderStatus, StatusConfig> = {
  created: {
    label: 'Criado',
    variant: 'outline',
    color: 'text-muted-foreground',
    progress: 25,
    icon: FileText,
    description: 'Pedido registrado no sistema'
  },
  paid: {
    label: 'Pago',
    variant: 'secondary',
    color: 'text-blue-600',
    progress: 50,
    icon: CreditCard,
    description: 'Pagamento confirmado'
  },
  processing: {
    label: 'Processando',
    variant: 'default',
    color: 'text-yellow-600',
    progress: 75,
    icon: Clock,
    description: 'Documento em processamento'
  },
  completed: {
    label: 'Entregue',
    variant: 'default',
    color: 'text-green-600',
    progress: 100,
    icon: Truck,
    description: 'Documento finalizado e entregue'
  },
  cancelled: {
    label: 'Cancelado',
    variant: 'destructive',
    color: 'text-destructive',
    progress: 0,
    icon: AlertCircle,
    description: 'Pedido cancelado'
  }
};

export function useOrderStatus(status: OrderStatus) {
  const statusConfig = useMemo(() => {
    return statusConfigMap[status] || statusConfigMap.created;
  }, [status]);

  const getNextStatus = useMemo(() => {
    const statusOrder: OrderStatus[] = ['created', 'paid', 'processing', 'completed'];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
  }, [status]);

  const canTransitionTo = useMemo(() => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      created: ['paid', 'cancelled'],
      paid: ['processing', 'cancelled'],
      processing: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };
    return transitions[status] || [];
  }, [status]);

  const formatProgress = useMemo(() => {
    return `${statusConfig.progress}%`;
  }, [statusConfig.progress]);

  return {
    ...statusConfig,
    getNextStatus,
    canTransitionTo,
    formatProgress,
    isCompleted: status === 'completed',
    isCancelled: status === 'cancelled',
    canBeCancelled: ['created', 'paid', 'processing'].includes(status)
  };
}