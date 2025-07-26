import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, User, LogIn, Bell, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import ChatBot from "@/components/ChatBot";
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
  const [showChat, setShowChat] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { user } = useAuth();
  const { isMobile } = useResponsiveLayout();
  const { info } = useNotifications();
  const navigate = useNavigate();

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowChat(true);
    info('Serviço selecionado', `Iniciando conversa sobre ${service.name}`);
  };

  const handleStartChat = () => {
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary to-primary-glow rounded-lg p-2 hover-scale">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  MeusDocumentos.AI
                </h1>
                <p className="text-sm text-muted-foreground">Documentos oficiais com IA</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <div className="hidden sm:block">
                  <NotificationCenter />
                </div>
              )}
              
              {user ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className={`${isMobile ? 'w-full' : ''} hover-scale`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {isMobile ? 'Dashboard' : 'Meus Pedidos'}
                  </Button>
                  <Button 
                    onClick={handleStartChat}
                    className={`hover-scale ${isMobile ? 'w-full' : ''} bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow`}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {isMobile ? 'Chat' : 'Novo Pedido'}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/auth/login')}
                    className={`${isMobile ? 'w-full' : ''} hover-scale`}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                  <Button 
                    onClick={handleStartChat}
                    className={`hover-scale ${isMobile ? 'w-full' : ''} bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow`}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {isMobile ? 'Assistente' : 'Fale com nosso Assistente'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-20">
        <HeroSection onStartChat={handleStartChat} />
        <BenefitsSection />
        <ServicesSection onServiceSelect={handleServiceSelect} />
        <ProcessSection />
        <TrustSection />
      </main>

      {/* ChatBot Modal */}
      {showChat && (
        <ChatBot 
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
            setSelectedService(null);
          }}
          selectedService={selectedService}
        />
      )}

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
