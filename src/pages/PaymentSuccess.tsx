import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, FileText, Printer, MessageCircle, Home, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressTracker } from "@/components/common/ProgressTracker";
import { QuickActions } from "@/components/common/QuickActions";
import { ActionButton } from "@/components/common/ActionButton";

interface OrderData {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  payment_status: string;
  status: string;
  estimated_completion_date: string;
  created_at: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isMobile, shouldUseModal } = useResponsiveLayout();
  const { success } = useNotifications();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { order_id: orderId }
        });

        if (error) {
          console.error('Error verifying payment:', error);
        } else {
          setOrder(data.order);
          success('Pagamento confirmado!', 'Seu pedido está sendo processado');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const orderSteps = [
    { id: 'order', label: 'Pedido', completed: true },
    { id: 'payment', label: 'Pagamento', completed: true },
    { id: 'processing', label: 'Processamento', completed: order?.status === 'processing' || order?.status === 'completed' },
    { id: 'delivery', label: 'Entrega', completed: order?.status === 'completed' }
  ];

  const quickActions = [
    {
      id: 'home',
      icon: Home,
      label: 'Início',
      onClick: () => { window.location.href = '/'; },
      variant: 'outline' as const
    },
    {
      id: 'print',
      icon: Printer,
      label: 'Imprimir',
      onClick: () => { window.print(); },
      variant: 'default' as const
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      onClick: () => { window.open('https://wa.me/5511999999999', '_blank'); },
      variant: 'outline' as const
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className={`w-full max-w-md animate-pulse ${isMobile ? 'mx-2' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span>Verificando pagamento...</span>
            </div>
            <div className="mt-4">
              <StatusBadge variant="secondary" className="w-full justify-center">
                Processando confirmação...
              </StatusBadge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className={`w-full max-w-md animate-fade-in ${isMobile ? 'mx-2' : ''}`}>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Pedido não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível encontrar os detalhes do seu pedido.
            </p>
            <StatusBadge variant="destructive" className="mb-4">
              Erro na verificação
            </StatusBadge>
            <ActionButton
              label="Voltar ao início"
              icon={Home}
              onClick={() => window.location.href = '/'}
              variant="default"
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className={`max-w-2xl mx-auto pt-8 ${isMobile ? 'px-2' : ''}`}>
        <ProgressTracker steps={orderSteps} className="mb-6" />
        
        <Card className="mb-6 animate-scale-in hover-scale">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 animate-scale-in" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Pagamento Confirmado!
            </CardTitle>
            <StatusBadge variant="default" className="mt-2 mx-auto">
              Pedido #{order.id.slice(0, 8)}
            </StatusBadge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg mb-2">
                Obrigado, <strong>{order.customer_name}</strong>!
              </p>
              <p className="text-muted-foreground">
                Seu pagamento foi processado com sucesso e já começamos a trabalhar no seu documento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Detalhes do Pedido
                </h3>
                <p><strong>Número:</strong> #{order.id.slice(0, 8)}</p>
                <p><strong>Valor:</strong> {formatCurrency(order.total_amount)}</p>
                <p><strong>Data:</strong> {formatDate(order.created_at)}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Prazo de Entrega
                </h3>
                <p className="text-lg font-semibold text-primary">
                  {formatDate(order.estimated_completion_date)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Estimativa de conclusão
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                Próximos Passos
              </h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Você receberá atualizações por email</li>
                <li>• Nossa equipe entrará em contato se precisar de mais informações</li>
                <li>• O documento será entregue no prazo estimado</li>
                <li>• Guarde este número do pedido: #{order.id.slice(0, 8)}</li>
              </ul>
            </div>

            <QuickActions 
              actions={quickActions}
              variant={isMobile ? "mobile" : "grid"}
              className="pt-4"
            />
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Precisa de ajuda? Entre em contato conosco pelo WhatsApp: 
            <a href="https://wa.me/5511999999999" className="text-primary hover:underline ml-1">
              (11) 99999-9999
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;