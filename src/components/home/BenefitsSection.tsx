import { useEffect, useRef, useState } from "react";
import { MessageCircle, Clock, DollarSign, Shield, Zap, Users } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
}

const BenefitsSection = () => {
  const { isMobile } = useResponsiveLayout();
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  const benefits: Benefit[] = [
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Conversa Inteligente",
      description: "Nossa IA entende suas necessidades e coleta as informações necessárias automaticamente",
      highlight: "100% Automatizado"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Processo Rápido",
      description: "Prazos transparentes e acompanhamento em tempo real do seu pedido",
      highlight: "Até 70% Mais Rápido"
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Preços Transparentes",
      description: "Sem taxas ocultas, valores claros e justos desde o primeiro momento",
      highlight: "Sem Surpresas"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Segurança Total",
      description: "Seus dados são protegidos com criptografia de nível bancário",
      highlight: "Certificação SSL"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Eficiência Máxima",
      description: "Eliminamos burocracias desnecessárias para acelerar seu processo",
      highlight: "Zero Burocracia"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Suporte Especializado",
      description: "Equipe dedicada para acompanhar cada etapa do seu documento",
      highlight: "24/7 Disponível"
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

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/5">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className={`transition-all duration-700 ${inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Por que escolher nossa plataforma?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolucionamos o processo de obtenção de documentos oficiais com tecnologia de ponta e atendimento humano
            </p>
          </div>
        </div>

        {/* Benefits grid */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-2 lg:grid-cols-3 gap-8'}`}>
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`group transition-all duration-700 ${
                inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:bg-card/80 hover:border-primary/20 hover:shadow-premium transition-all duration-500 group-hover:scale-105">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                {/* Shine effect */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                <div className="relative z-10">
                  {/* Icon container */}
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {benefit.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                        {benefit.title}
                      </h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {benefit.highlight}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                      {benefit.description}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-700 ${inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: '0.8s' }}>
          <p className="text-lg text-muted-foreground">
            Mais de <span className="text-primary font-bold">15.000 documentos</span> processados com{' '}
            <span className="text-primary font-bold">98% de satisfação</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;