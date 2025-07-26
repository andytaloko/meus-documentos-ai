import { useEffect, useRef, useState } from "react";
import { MessageCircle, Search, FileText, CreditCard, CheckCircle, Download } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface ProcessStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}

const ProcessSection = () => {
  const { isMobile } = useResponsiveLayout();
  const [inView, setInView] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const steps: ProcessStep[] = [
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Converse com nossa IA",
      description: "Descreva qual documento você precisa. Nossa inteligência artificial vai entender suas necessidades e coletar as informações necessárias.",
      time: "2-3 min"
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Análise e Validação",
      description: "Verificamos automaticamente todos os dados fornecidos e identificamos a melhor forma de obter seu documento.",
      time: "5-10 min"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Pagamento Seguro",
      description: "Realize o pagamento de forma segura através de PIX, cartão ou boleto. Valores transparentes, sem taxas ocultas.",
      time: "1-2 min"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Processamento",
      description: "Nossa equipe especializada inicia o processo junto aos órgãos competentes. Acompanhe o status em tempo real.",
      time: "1-7 dias"
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Validação Final",
      description: "Verificamos a autenticidade e qualidade do documento antes da entrega, garantindo que tudo está correto.",
      time: "2-4 horas"
    },
    {
      icon: <Download className="h-8 w-8" />,
      title: "Entrega Digital",
      description: "Receba seu documento autenticado por email e acesse-o a qualquer momento através da nossa plataforma.",
      time: "Imediato"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [inView, steps.length]);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/10 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Como Funciona
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Um processo simples, transparente e totalmente digital para obter seus documentos oficiais
          </p>
        </div>

        {/* Process timeline */}
        <div className="relative">
          {/* Progress line */}
          {!isMobile && (
            <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          )}

          {/* Steps */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-2 lg:grid-cols-3 gap-8'}`}>
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`group transition-all duration-700 ${
                  inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className={`relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:bg-card/80 hover:border-primary/20 hover:shadow-premium transition-all duration-500 h-full ${
                    activeStep === index ? 'border-primary/40 shadow-glow' : ''
                  }`}
                >
                  {/* Step number */}
                  <div className="absolute -top-4 left-8">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      activeStep === index 
                        ? 'bg-gradient-to-r from-primary to-primary-glow text-white scale-110' 
                        : 'bg-background border-2 border-border text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Time badge */}
                  <div className="absolute -top-2 right-4">
                    <div className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                      {step.time}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 ${
                      activeStep === index 
                        ? 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary scale-110' 
                        : 'bg-gradient-to-br from-primary/10 to-primary/5 text-primary group-hover:scale-105'
                    }`}>
                      {step.icon}
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                      activeStep === index ? 'text-primary' : 'group-hover:text-primary'
                    }`}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                      {step.description}
                    </p>

                    {/* Progress indicator */}
                    <div className={`mt-6 h-1 bg-border rounded-full overflow-hidden transition-all duration-1000 ${
                      activeStep === index ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-3000 ease-linear"
                        style={{ 
                          width: activeStep === index ? '100%' : '0%',
                          transition: 'width 3s linear'
                        }}
                      />
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>

          {/* Call to action */}
          <div className={`text-center mt-16 transition-all duration-700 ${inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: '0.8s' }}>
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="text-lg">
                <span className="font-bold text-primary">Processo 100% digital</span> - 
                Sem filas, sem burocracia, sem complicações
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;