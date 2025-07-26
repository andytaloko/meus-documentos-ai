import { cn } from "@/lib/utils";
import { Check, Clock, CreditCard, FileText, Truck } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  status: string;
}

const steps = [
  { 
    label: 'Criado', 
    icon: FileText,
    description: 'Pedido registrado'
  },
  { 
    label: 'Pago', 
    icon: CreditCard,
    description: 'Pagamento confirmado'
  },
  { 
    label: 'Processando', 
    icon: Clock,
    description: 'Em processamento'
  },
  { 
    label: 'Entregue', 
    icon: Truck,
    description: 'Documento pronto'
  }
];

export function ProgressIndicator({ currentStep, totalSteps, status }: ProgressIndicatorProps) {
  const isCompleted = (step: number) => step < currentStep;
  const isCurrent = (step: number) => step === currentStep;
  const isCancelled = status === 'cancelled';

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-3">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const Icon = step.icon;
            
            return (
              <div key={index} className="flex flex-col items-center relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "absolute top-5 left-6 w-full h-0.5 transition-colors duration-300",
                      isCompleted(stepNumber + 1) || isCurrent(stepNumber + 1) 
                        ? "bg-primary" 
                        : "bg-muted"
                    )}
                    style={{ width: 'calc(100% + 2rem)' }}
                  />
                )}
                
                {/* Step circle */}
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-300",
                    isCancelled 
                      ? "border-destructive bg-destructive/10"
                      : isCompleted(stepNumber)
                        ? "border-primary bg-primary text-primary-foreground" 
                        : isCurrent(stepNumber)
                          ? "border-primary bg-background text-primary animate-pulse"
                          : "border-muted bg-muted/20 text-muted-foreground"
                  )}
                >
                  {isCancelled ? (
                    <span className="text-destructive font-bold">✕</span>
                  ) : isCompleted(stepNumber) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                
                {/* Step label - only show on larger screens */}
                <div className="hidden sm:block text-center mt-2">
                  <p className={cn(
                    "text-xs font-medium",
                    isCancelled 
                      ? "text-destructive"
                      : isCompleted(stepNumber) || isCurrent(stepNumber)
                        ? "text-foreground" 
                        : "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current status description */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {isCancelled 
            ? "Pedido cancelado"
            : currentStep > 0 && currentStep <= steps.length
              ? steps[currentStep - 1]?.description
              : "Aguardando processamento"
          }
        </p>
      </div>
    </div>
  );
}