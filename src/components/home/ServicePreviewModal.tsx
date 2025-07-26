import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BottomSheet, 
  BottomSheetContent, 
  BottomSheetHeader, 
  BottomSheetTitle, 
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetClose
} from "@/components/ui/bottom-sheet";
import { 
  Clock, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Users,
  Shield,
  X
} from "lucide-react";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  estimated_days: number;
}

interface ServicePreviewModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (service: Service) => void;
}

export function ServicePreviewModal({ service, isOpen, onClose, onSelect }: ServicePreviewModalProps) {
  const { isMobile } = useResponsiveLayout();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!service) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const handleSelect = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
    onSelect(service);
    setIsProcessing(false);
  };

  const categoryBenefits = {
    "Cartório": ["Documento oficial reconhecido", "Processamento rápido", "Entrega digital"],
    "Receita Federal": ["Consulta oficial CPF", "Dados atualizados", "Segurança garantida"],
    "Detran": ["Informações veiculares", "Multas e pontuação", "Licenciamento"],
    "Trabalho": ["Carteira de trabalho", "Benefícios INSS", "Histórico profissional"],
    "Outros": ["Diversos documentos", "Atendimento especializado", "Suporte completo"]
  };

  const benefits = categoryBenefits[service.category as keyof typeof categoryBenefits] || categoryBenefits.Outros;

  const content = (
    <>
      {/* Header with close button for mobile */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Detalhes do Serviço</h2>
          <BottomSheetClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </BottomSheetClose>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Service header */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground">{service.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {service.category}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {service.description}
          </p>
        </div>

        <Separator />

        {/* Pricing and timing */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Preço</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(service.base_price)}
            </div>
            <p className="text-xs text-muted-foreground">a partir de</p>
          </Card>

          <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Prazo</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {service.estimated_days}
            </div>
            <p className="text-xs text-muted-foreground">dias úteis</p>
          </Card>
        </div>

        {/* Benefits */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            O que está incluído
          </h4>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-card/30 rounded-lg">
          <div className="text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-xs font-medium">15k+</div>
            <div className="text-xs text-muted-foreground">Clientes</div>
          </div>
          <div className="text-center">
            <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-xs font-medium">100%</div>
            <div className="text-xs text-muted-foreground">Seguro</div>
          </div>
          <div className="text-center">
            <CheckCircle className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-xs font-medium">4.9/5</div>
            <div className="text-xs text-muted-foreground">Avaliação</div>
          </div>
        </div>

        {/* Important note */}
        <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Os preços podem variar dependendo da complexidade do documento e região.
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-6 border-t bg-card/50">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button 
            onClick={handleSelect}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
          >
            {isProcessing ? "Processando..." : "Solicitar Agora"}
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <BottomSheet open={isOpen} onOpenChange={onClose}>
        <BottomSheetContent className="max-h-[85vh] overflow-y-auto">
          {content}
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  // Desktop modal
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md shadow-2xl">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Detalhes do Serviço</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {content}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}