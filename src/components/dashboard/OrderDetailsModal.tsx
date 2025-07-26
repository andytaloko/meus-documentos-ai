import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Clock, CreditCard, User, Phone, Mail, FileText, Calendar } from "lucide-react";
import { ProgressIndicator } from "./ProgressIndicator";

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

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  pending: { label: 'Pendente', variant: 'secondary' as const, color: 'bg-orange-500', step: 1 },
  processing: { label: 'Em Processamento', variant: 'default' as const, color: 'bg-blue-500', step: 2 },
  completed: { label: 'Concluído', variant: 'default' as const, color: 'bg-green-500', step: 4 },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const, color: 'bg-red-500', step: 0 },
};

const paymentStatusConfig = {
  pending: { label: 'Aguardando Pagamento', variant: 'secondary' as const },
  paid: { label: 'Pago', variant: 'default' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const },
};

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
  const paymentInfo = paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'Não informado';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Detalhes do Pedido
            </DialogTitle>
            <Badge variant={statusInfo.variant} className="ml-2">
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            #{order.id.slice(-8).toUpperCase()}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Info */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Serviço Solicitado
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium">{order.services?.name || 'Serviço'}</h4>
              <p className="text-sm text-muted-foreground">{order.services?.category}</p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="font-semibold text-lg">{formatPrice(order.total_amount)}</span>
                <Badge variant={paymentInfo.variant}>
                  <CreditCard className="w-3 h-3 mr-1" />
                  {paymentInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <h3 className="font-semibold">Status do Pedido</h3>
            <ProgressIndicator 
              currentStep={statusInfo.step} 
              totalSteps={4}
              status={order.status}
            />
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground">Nome Completo</label>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">CPF</label>
                  <p className="font-medium">{formatCPF(order.customer_cpf)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    E-mail
                  </label>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Telefone
                  </label>
                  <p className="font-medium">{formatPhone(order.customer_phone)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Cronograma
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Pedido Criado</label>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Previsão de Entrega</label>
                <p className="font-medium">
                  {order.estimated_completion_date 
                    ? new Date(order.estimated_completion_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                    : 'A definir'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Fechar
            </Button>
            {order.status === 'completed' && (
              <Button className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                Baixar Documento
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}