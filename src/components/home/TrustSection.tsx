import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, Shield, Award, Users, CheckCircle } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  comment: string;
  service: string;
  avatar: string;
}

const TrustSection = () => {
  const { isMobile } = useResponsiveLayout();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const swipeRef = useSwipeGestures<HTMLDivElement>({
    onSwipeLeft: () => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length),
    onSwipeRight: () => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length),
  });

  const testimonials: Testimonial[] = [
    {
      name: "Maria Silva",
      location: "São Paulo, SP",
      rating: 5,
      comment: "Processo super rápido e fácil! Consegui minha certidão em 2 dias, muito mais rápido que ir pessoalmente ao cartório.",
      service: "Certidão de Nascimento",
      avatar: "MS"
    },
    {
      name: "João Santos",
      location: "Rio de Janeiro, RJ",
      rating: 5,
      comment: "O assistente virtual é incrível, entendeu exatamente o que eu precisava e me orientou em cada passo. Recomendo!",
      service: "CPF 2ª Via",
      avatar: "JS"
    },
    {
      name: "Ana Costa",
      location: "Belo Horizonte, MG",
      rating: 5,
      comment: "Atendimento excepcional e preços justos. Economizei tempo e dinheiro comparado aos métodos tradicionais.",
      service: "IPVA Atrasado",
      avatar: "AC"
    }
  ];

  const trustBadges = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "SSL Certificado",
      description: "Segurança bancária"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "ISO 27001",
      description: "Certificação internacional"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "LGPD Compliance",
      description: "Proteção de dados"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "+15k Clientes",
      description: "Satisfação garantida"
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
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/10">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Confiança e Excelência
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Milhares de brasileiros já confiam em nossa plataforma para seus documentos oficiais
          </p>
        </div>

        {/* Testimonials carousel */}
        <div ref={swipeRef} className={`mb-16 transition-all duration-700 ${inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: '0.2s' }}>
          <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-500">
            <CardContent className="p-8">
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                
                <div className="text-center">
                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Comment */}
                  <blockquote className="text-lg sm:text-xl text-foreground mb-6 italic leading-relaxed">
                    "{testimonials[currentTestimonial].comment}"
                  </blockquote>

                  {/* Author info */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-white font-bold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{testimonials[currentTestimonial].name}</div>
                      <div className="text-sm text-muted-foreground">{testimonials[currentTestimonial].location}</div>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {testimonials[currentTestimonial].service}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'bg-primary scale-125' 
                    : 'bg-primary/30 hover:bg-primary/50'
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'} transition-all duration-700 ${inView ? 'animate-slideUp' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: '0.4s' }}>
          {trustBadges.map((badge, index) => (
            <div
              key={badge.title}
              className="group text-center p-6 bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl hover:bg-card/50 hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                {badge.icon}
              </div>
              <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">
                {badge.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {badge.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div className={`text-center mt-16 transition-all duration-700 ${inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: '0.6s' }}>
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">4.9/5</span>
              <span className="text-muted-foreground text-sm">avaliação média</span>
            </div>
            <div className="w-px h-6 bg-border/50" />
            <div className="text-sm text-muted-foreground">
              Baseado em <span className="font-semibold text-foreground">2.847 avaliações</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;