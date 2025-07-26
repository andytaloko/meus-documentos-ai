import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Play, ArrowRight, Users, Clock, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface HeroSectionProps {
  onStartChat: () => void;
}

interface Stat {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
}

const HeroSection = ({ onStartChat }: HeroSectionProps) => {
  const { user } = useAuth();
  const { isMobile } = useResponsiveLayout();
  const [animatedStats, setAnimatedStats] = useState<Record<string, number>>({
    documents: 0,
    users: 0,
    satisfaction: 0,
  });

  const stats: Stat[] = [
    {
      label: "Documentos Processados",
      value: 15420,
      suffix: "+",
      icon: <Clock className="h-5 w-5 text-primary" />
    },
    {
      label: "Usuários Atendidos",
      value: 3280,
      suffix: "+",
      icon: <Users className="h-5 w-5 text-primary" />
    },
    {
      label: "Satisfação",
      value: 98,
      suffix: "%",
      icon: <Star className="h-5 w-5 text-primary" />
    }
  ];

  useEffect(() => {
    const animateCounters = () => {
      stats.forEach((stat, index) => {
        const key = Object.keys(animatedStats)[index];
        let current = 0;
        const increment = stat.value / 100;
        const timer = setInterval(() => {
          current += increment;
          if (current >= stat.value) {
            current = stat.value;
            clearInterval(timer);
          }
          setAnimatedStats(prev => ({
            ...prev,
            [key]: Math.floor(current)
          }));
        }, 20);
      });
    };

    const timeout = setTimeout(animateCounters, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Main headline with gradient text */}
          <div className="animate-fadeInUp">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
              Documentos Oficiais
              <span className="block text-primary">com IA</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Nosso assistente virtual analisa suas necessidades e te guia através do processo completo de forma <span className="text-primary font-semibold">inteligente e segura</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row justify-center gap-6'} mb-16 animate-fadeInUp`} style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300 text-lg px-8 py-6 h-auto"
              onClick={onStartChat}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <MessageCircle className="mr-2 h-5 w-5" />
              {user ? 'Novo Pedido' : 'Começar Agora'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="group border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-lg px-8 py-6 h-auto backdrop-blur-sm bg-background/50"
            >
              <Play className="mr-2 h-5 w-5" />
              Ver Como Funciona
            </Button>
          </div>

          {/* Animated Stats */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-3 gap-8'} mb-16 animate-slideUp`} style={{ animationDelay: '0.6s' }}>
            {stats.map((stat, index) => (
              <div key={stat.label} className="group">
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/80 hover:border-primary/20 transition-all duration-300 hover:shadow-card">
                  <div className="flex items-center justify-center mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2 animate-counter">
                    {Object.values(animatedStats)[index]?.toLocaleString() || 0}{stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
            <p className="text-sm text-muted-foreground mb-4">
              Confiado por milhares de brasileiros
            </p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;