import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, MessageCircle, Clock, DollarSign, User, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ChatBot from "@/components/ChatBot";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  estimated_days: number;
}

const Index = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('category, name');

    if (error) {
      console.error('Erro ao buscar serviços:', error);
    } else {
      setServices(data || []);
    }
  };

  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowChat(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MeusDocumentos.AI</h1>
                <p className="text-sm text-gray-600">Documentos oficiais de forma simples e rápida</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Meus Pedidos
                  </Button>
                  <Button 
                    onClick={() => setShowChat(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Novo Pedido
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/auth')}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                  <Button 
                    onClick={() => setShowChat(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Fale com nosso Assistente
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Solicite seus documentos oficiais com inteligência artificial
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Nosso assistente virtual analisa suas necessidades e te guia através do processo completo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center p-4">
              <MessageCircle className="h-12 w-12 text-primary mb-2" />
              <h3 className="font-semibold text-gray-900">Conversa Inteligente</h3>
              <p className="text-sm text-gray-600 text-center">
                Nossa IA entende suas necessidades e coleta as informações necessárias
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Clock className="h-12 w-12 text-primary mb-2" />
              <h3 className="font-semibold text-gray-900">Processo Rápido</h3>
              <p className="text-sm text-gray-600 text-center">
                Prazos transparentes e acompanhamento em tempo real
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <DollarSign className="h-12 w-12 text-primary mb-2" />
              <h3 className="font-semibold text-gray-900">Preços Claros</h3>
              <p className="text-sm text-gray-600 text-center">
                Sem taxas ocultas, valores transparentes desde o início
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Nossos Serviços
          </h2>
          <div className="grid gap-8">
            {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryServices.map((service) => (
                    <Card 
                      key={service.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(service.base_price)}
                            </span>
                            <span className="text-xs text-gray-500">a partir de</span>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.estimated_days} dias
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 MeusDocumentos.AI - Simplificando a obtenção de documentos oficiais
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
