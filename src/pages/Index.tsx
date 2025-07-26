import { useState } from "react";
import { FileText } from "lucide-react";
import { useChatBot } from "@/contexts/ChatBotContext";
import { useNotifications } from "@/hooks/useNotifications";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import HeroSection from "@/components/home/HeroSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import ServicesSection from "@/components/home/ServicesSection";
import TrustSection from "@/components/home/TrustSection";
import ProcessSection from "@/components/home/ProcessSection";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  estimated_days: number;
}

const Index = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { setIsOpen: setChatOpen, addMessage } = useChatBot();
  const { info } = useNotifications();

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    
    // Add service context to chat
    addMessage({
      type: 'bot',
      content: `Olá! 👋 Vejo que você está interessado em solicitar: **${service.name}**\n\nEste documento tem um custo a partir de **R$ ${formatPrice(service.base_price)}** e prazo estimado de **${service.estimated_days} dias úteis**.\n\nPara começar, preciso de algumas informações básicas. Qual é o seu nome completo?`,
      service
    });
    
    setChatOpen(true);
    info('Serviço selecionado', `Iniciando conversa sobre ${service.name}`);
  };

  const handleStartChat = () => {
    setChatOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation Header */}
      <NavigationHeader onServiceSelect={handleServiceSelect} />

      {/* Main content */}
      <main className="pt-16">
        <HeroSection onStartChat={handleStartChat} />
        <BenefitsSection />
        <ServicesSection onServiceSelect={handleServiceSelect} />
        <ProcessSection />
        <TrustSection />
      </main>

      {/* ChatBot is now handled by FloatingChatButton in App.tsx via ChatBotContext */}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-card to-secondary/20 border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-primary to-primary-glow rounded-lg p-2">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                MeusDocumentos.AI
              </h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Simplificando a obtenção de documentos oficiais com inteligência artificial
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 MeusDocumentos.AI - Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
