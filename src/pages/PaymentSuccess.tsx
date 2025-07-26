import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span>Verificando pagamento...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Pedido não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível encontrar os detalhes do seu pedido.
            </p>
            <Link to="/">
              <Button>Voltar ao início</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Pagamento Confirmado!
            </CardTitle>
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

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Fazer outro pedido
                </Button>
              </Link>
              <Button 
                className="flex-1"
                onClick={() => window.print()}
              >
                Imprimir comprovante
              </Button>
            </div>
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