import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, QrCode, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  amount: number;
  customerData: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    documentData?: any;
  };
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  serviceId, 
  serviceName, 
  amount, 
  customerData 
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>(null);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    qr_code_url: string;
    pix_code: string;
    order_id: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  const handleCardPayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount,
          currency: 'brl',
          serviceId,
          customerData: {
            ...customerData,
            serviceName
          }
        }
      });

      if (error) {
        throw error;
      }

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      onClose();
      toast.success("Redirecionando para o pagamento...");
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePixPayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          amount,
          serviceId,
          customerData
        }
      });

      if (error) {
        throw error;
      }

      setPixData(data);
      toast.success("PIX gerado com sucesso!");
    } catch (error) {
      console.error('Error creating PIX payment:', error);
      toast.error("Erro ao gerar PIX. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = async () => {
    if (pixData?.pix_code) {
      try {
        await navigator.clipboard.writeText(pixData.pix_code);
        setCopied(true);
        toast.success("Código PIX copiado!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Erro ao copiar código PIX");
      }
    }
  };

  const handleClose = () => {
    setPaymentMethod(null);
    setPixData(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Pagamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold">{serviceName}</h3>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(amount)}
            </p>
          </div>

          {!paymentMethod && !pixData && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Escolha a forma de pagamento:
              </p>
              
              <Button
                onClick={() => setPaymentMethod('card')}
                className="w-full justify-start"
                variant="outline"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-3" />
                Cartão de Crédito/Débito
              </Button>
              
              <Button
                onClick={() => setPaymentMethod('pix')}
                className="w-full justify-start"
                variant="outline"
                size="lg"
              >
                <QrCode className="h-5 w-5 mr-3" />
                PIX
              </Button>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">Cartão de Crédito/Débito</h4>
                      <p className="text-sm text-muted-foreground">
                        Pagamento seguro via Stripe
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setPaymentMethod(null)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handleCardPayment}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Pagar
                </Button>
              </div>
            </div>
          )}

          {paymentMethod === 'pix' && !pixData && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <QrCode className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">PIX</h4>
                      <p className="text-sm text-muted-foreground">
                        Pagamento instantâneo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setPaymentMethod(null)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handlePixPayment}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Gerar PIX
                </Button>
              </div>
            </div>
          )}

          {pixData && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-semibold mb-2">PIX Gerado com Sucesso!</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Escaneie o QR Code ou copie o código PIX
                </p>
                
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img 
                    src={pixData.qr_code_url} 
                    alt="QR Code PIX" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Código PIX:</label>
                <div className="flex space-x-2">
                  <div className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                    {pixData.pix_code}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPixCode}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>⏰ Este PIX expira em 30 minutos</p>
                <p>Após o pagamento, você será redirecionado automaticamente</p>
              </div>

              <Button 
                variant="outline" 
                onClick={handleClose}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;