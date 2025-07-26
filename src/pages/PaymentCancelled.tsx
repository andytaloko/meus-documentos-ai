import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, MessageCircle } from "lucide-react";

const PaymentCancelled = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-md mx-auto pt-16">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle className="text-2xl text-orange-600">
              Pagamento Cancelado
            </CardTitle>
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

            <div className="space-y-3">
              <Link to="/" className="block">
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </Link>
              
              <a 
                href="https://wa.me/5511999999999?text=Olá, tive um problema com o pagamento do meu pedido e gostaria de ajuda"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </a>
            </div>

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