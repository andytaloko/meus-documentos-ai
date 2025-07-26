import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, MessageCircle, Home, RefreshCw } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButton } from "@/components/common/ActionButton";
import { QuickActions } from "@/components/common/QuickActions";

const PaymentCancelled = () => {
  const { isMobile, shouldUseModal } = useResponsiveLayout();
  const { warning } = useNotifications();

  const quickActions = [
    {
      id: 'retry',
      icon: <RefreshCw className="w-4 h-4" />,
      label: 'Tentar novamente',
      onClick: () => { window.location.href = '/'; },
      variant: 'default' as const
    },
    {
      id: 'support',
      icon: <MessageCircle className="w-4 h-4" />,
      label: 'Suporte',
      onClick: () => { window.open('https://wa.me/5511999999999?text=Olá, tive um problema com o pagamento do meu pedido', '_blank'); },
      variant: 'outline' as const
    },
    {
      id: 'home',
      icon: <Home className="w-4 h-4" />,
      label: 'Início',
      onClick: () => { window.location.href = '/'; },
      variant: 'outline' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className={`max-w-md mx-auto pt-16 ${isMobile ? 'px-2' : ''}`}>
        <Card className="animate-fade-in hover-scale">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-orange-500 animate-scale-in" />
            </div>
            <CardTitle className="text-2xl text-orange-600">
              Pagamento Cancelado
            </CardTitle>
            <StatusBadge variant="destructive" className="mt-2 mx-auto">
              Transação não concluída
            </StatusBadge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Seu pagamento foi cancelado. Não se preocupe, nenhuma cobrança foi realizada.
              </p>
              <p className="text-sm text-muted-foreground">
                Se você cancelou por engano ou encontrou algum problema, 
                podemos ajudá-lo a finalizar seu pedido.
              </p>
            </div>

            <QuickActions 
              actions={quickActions}
              variant={isMobile ? "mobile" : "list"}
              className="space-y-3"
            />

            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>
                Seus dados estão seguros. Nenhuma informação de pagamento foi armazenada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentCancelled;