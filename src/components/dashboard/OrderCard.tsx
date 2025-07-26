import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressIndicator } from "./ProgressIndicator";
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

const statusConfig = {
  pending: { label: 'Pendente', variant: 'secondary' as const, color: 'bg-orange-500', step: 1 },
  processing: { label: 'Em Processamento', variant: 'default' as const, color: 'bg-blue-500', step: 2 },
  completed: { label: 'Concluído', variant: 'default' as const, color: 'bg-green-500', step: 4 },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const, color: 'bg-red-500', step: 0 },
};

const paymentStatusConfig = {
  pending: { label: 'Aguardando', variant: 'secondary' as const, color: 'text-orange-600' },
  paid: { label: 'Pago', variant: 'default' as const, color: 'text-green-600' },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const, color: 'text-red-600' },
};

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const { setIsOpen, addMessage } = useChatBot();
  
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
  const paymentInfo = paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig];

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
**Status:** ${statusInfo.label}
**Pagamento:** ${paymentInfo.label}
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

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
          <Badge 
            variant={statusInfo.variant}
            className="flex items-center gap-1"
          >
            <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
            {statusInfo.label}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <ProgressIndicator 
            currentStep={statusInfo.step} 
            totalSteps={4}
            status={order.status}
          />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <CreditCard className="w-3 h-3" />
              Pagamento
            </div>
            <p className={`text-sm font-medium ${paymentInfo.color}`}>
              {paymentInfo.label}
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails?.(order)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Detalhes
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleChatAboutOrder}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Assistente
          </Button>
          {order.status === 'completed' && (
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Order ID */}
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          ID: #{order.id.slice(-8).toUpperCase()}
        </div>
      </CardContent>
    </Card>
  );
}