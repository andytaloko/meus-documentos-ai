import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressIndicator } from "./ProgressIndicator";
import { QuickActions } from "@/components/common/QuickActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressTracker } from "@/components/common/ProgressTracker";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { Clock, CreditCard, MessageSquare, Eye, FileText } from "lucide-react";
import { useChatBot } from "@/contexts/ChatBotContext";

interface Order {
  id: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string;
  total_amount: number;
  estimated_completion_date: string;
  created_at: string;
  services: {
    name: string;
    category: string;
  } | null;
}

interface OrderCardProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
}


export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const { setIsOpen, addMessage } = useChatBot();
  const orderStatus = useOrderStatus(order.status as any);
  const { isMobile, getCardSize } = useResponsiveLayout();

  const handleChatAboutOrder = () => {
    addMessage({
      type: 'user',
      content: `Preciso de ajuda com o pedido #${order.id.slice(-8).toUpperCase()}`
    });
    
    setTimeout(() => {
      addMessage({
        type: 'bot',
        content: `📋 **Informações do Pedido #${order.id.slice(-8).toUpperCase()}**

**Serviço:** ${order.services?.name || 'Serviço'}
**Status:** ${orderStatus.label}
**Pagamento:** ${order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
**Valor:** R$ ${(order.total_amount / 100).toFixed(2)}
**Data do pedido:** ${new Date(order.created_at).toLocaleDateString('pt-BR')}

Como posso te ajudar com este pedido? 🤔`
      });
    }, 1000);
    
    setIsOpen(true);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const cardActions = [
    {
      id: 'view',
      label: 'Detalhes',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onViewDetails?.(order),
      variant: 'outline' as const,
      tooltip: 'Ver detalhes completos do pedido'
    },
    {
      id: 'chat',
      label: isMobile ? '' : 'Assistente',
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: handleChatAboutOrder,
      variant: 'outline' as const,
      tooltip: 'Conversar sobre este pedido'
    },
    ...(orderStatus.isCompleted ? [{
      id: 'download',
      label: '',
      icon: <FileText className="w-4 h-4" />,
      onClick: () => console.log('Download document'),
      variant: 'outline' as const,
      tooltip: 'Baixar documento finalizado'
    }] : [])
  ];

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-1">
              {order.services?.name || 'Serviço'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {order.services?.category}
            </p>
          </div>
          <StatusBadge 
            status={order.status as any}
            showIcon={true}
            className="animate-scale-in"
          />
        </div>

        {/* Progress Tracker */}
        <div className="mb-4">
          <ProgressTracker 
            currentStatus={order.status as any}
            showTimeline={!isMobile}
            showDescriptions={!isMobile}
            size={isMobile ? 'sm' : 'md'}
          />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <CreditCard className="w-3 h-3" />
              Pagamento
            </div>
            <p className={`text-sm font-medium ${
              order.payment_status === 'paid' ? 'text-success' : 'text-warning'
            }`}>
              {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              Valor
            </div>
            <p className="text-sm font-semibold">
              {formatPrice(order.total_amount)}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
          <div>
            <span className="text-muted-foreground">Pedido em:</span>
            <p className="font-medium">
              {new Date(order.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Previsão:</span>
            <p className="font-medium">
              {order.estimated_completion_date 
                ? new Date(order.estimated_completion_date).toLocaleDateString('pt-BR')
                : 'A definir'
              }
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions 
          actions={cardActions}
          size="sm"
          maxActions={isMobile ? 2 : 3}
          compact={isMobile}
        />

        {/* Order ID */}
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          ID: #{order.id.slice(-8).toUpperCase()}
        </div>
      </CardContent>
    </Card>
  );
}