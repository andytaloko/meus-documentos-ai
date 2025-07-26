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
    <Card className="group hover:shadow-premium transition-all duration-500 hover:-translate-y-2 animate-fadeInUp border-0 shadow-card bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
      <CardContent className="p-6 relative overflow-hidden">
        {/* Premium subtle overlay */}
        <div className="absolute inset-0 bg-gradient-glass opacity-40 pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight mb-2 text-foreground/90 group-hover:text-foreground transition-colors duration-300">
              {order.services?.name || 'Serviço'}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {order.services?.category}
            </p>
          </div>
          <StatusBadge 
            status={order.status as any}
            showIcon={true}
            className="animate-fadeInUp shadow-sm ring-1 ring-border/20 backdrop-blur-sm"
          />
        </div>

        {/* Progress Tracker */}
        <div className="mb-6 relative z-10 bg-secondary/30 rounded-lg p-4 backdrop-blur-sm border border-border/40">
          <ProgressTracker 
            currentStatus={order.status as any}
            showTimeline={!isMobile}
            showDescriptions={!isMobile}
            size={isMobile ? 'sm' : 'md'}
          />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 font-medium">
              <CreditCard className="w-3.5 h-3.5" />
              Pagamento
            </div>
            <p className={`text-sm font-bold flex items-center gap-2 ${
              order.payment_status === 'paid' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                order.payment_status === 'paid' 
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' 
                  : 'bg-amber-500 shadow-sm shadow-amber-500/50'
              }`} />
              {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Valor
            </div>
            <p className="text-sm font-bold text-foreground bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
              {formatPrice(order.total_amount)}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-xs relative z-10">
          <div className="space-y-1">
            <span className="text-muted-foreground/80 font-medium">Pedido em:</span>
            <p className="font-semibold text-foreground/90">
              {new Date(order.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground/80 font-medium">Previsão:</span>
            <p className="font-semibold text-foreground/90">
              {order.estimated_completion_date 
                ? new Date(order.estimated_completion_date).toLocaleDateString('pt-BR')
                : 'A definir'
              }
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative z-10 bg-secondary/20 rounded-lg p-3 backdrop-blur-sm border border-border/30">
          <QuickActions 
            actions={cardActions}
            size="sm"
            maxActions={isMobile ? 2 : 3}
            className="gap-3"
          />
        </div>

        {/* Order ID */}
        <div className="mt-4 pt-4 border-t border-border/40 text-xs text-muted-foreground/70 relative z-10">
          <span className="font-mono font-medium">ID: #{order.id.slice(-8).toUpperCase()}</span>
        </div>
      </CardContent>
    </Card>
  );
}