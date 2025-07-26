import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, X, FileText, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PaymentModal from "./PaymentModal";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  estimated_days: number;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  service?: Service;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: Service | null;
}

const CONVERSATION_STEPS = {
  GREETING: 1,
  SERVICE_SELECTION: 2,
  DOCUMENT_ANALYSIS: 3,
  REQUIREMENTS_GATHERING: 4,
  FEE_CALCULATION: 5,
  ORDER_CREATION: 6,
  CHECKOUT: 7,
  STATUS_TRACKING: 8
};

const ChatBot = ({ isOpen, onClose, selectedService }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(CONVERSATION_STEPS.GREETING);
  const [conversationData, setConversationData] = useState<any>({});
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      initializeConversation();
    }
  }, [isOpen, selectedService]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeConversation = () => {
    const welcomeMessages: Message[] = [];

    if (selectedService) {
      welcomeMessages.push({
        id: `msg_${Date.now()}`,
        type: 'bot',
        content: `Olá! 👋 Vejo que você está interessado em solicitar: **${selectedService.name}**`,
        timestamp: new Date(),
        service: selectedService
      });

      setTimeout(() => {
        addBotMessage(`Este documento tem um custo a partir de **R$ ${formatPrice(selectedService.base_price)}** e prazo estimado de **${selectedService.estimated_days} dias úteis**.

Para começar, preciso de algumas informações básicas. Qual é o seu nome completo?`);
        setCurrentStep(CONVERSATION_STEPS.REQUIREMENTS_GATHERING);
        setConversationData({ selectedService });
      }, 1000);
    } else {
      welcomeMessages.push({
        id: `msg_${Date.now()}`,
        type: 'bot',
        content: `Olá! 👋 Sou o assistente virtual do **MeusDocumentos.AI**. 

Estou aqui para te ajudar a solicitar documentos oficiais de forma rápida e segura.

Que tipo de documento você precisa?`,
        timestamp: new Date()
      });
      setCurrentStep(CONVERSATION_STEPS.SERVICE_SELECTION);
    }

    setMessages(welcomeMessages);
  };

  const addBotMessage = (content: string, service?: Service) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      service
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const handleServiceRecommendation = async (userInput: string) => {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true);

    if (error) {
      addBotMessage("Desculpe, ocorreu um erro ao buscar os serviços. Tente novamente em alguns instantes.");
      return;
    }

    // Simula análise de IA para recomendar serviços
    const keywords = userInput.toLowerCase();
    let recommendedServices = services?.filter(service => 
      service.name.toLowerCase().includes(keywords) ||
      service.category.toLowerCase().includes(keywords) ||
      service.description.toLowerCase().includes(keywords)
    ) || [];

    if (recommendedServices.length === 0) {
      // Se não encontrar por keywords, mostrar os mais populares
      recommendedServices = services?.slice(0, 3) || [];
    }

    addBotMessage(`Baseado na sua solicitação, encontrei estas opções:`);

    recommendedServices.forEach((service, index) => {
      setTimeout(() => {
        addBotMessage(`**${service.name}**
${service.description}

💰 A partir de ${formatPrice(service.base_price)}
⏱️ Prazo: ${service.estimated_days} dias úteis
📁 Categoria: ${service.category}

Para solicitar este documento, digite: **${index + 1}**`, service);
      }, (index + 1) * 800);
    });

    setTimeout(() => {
      addBotMessage("Digite o número da opção desejada ou descreva melhor o que você precisa.");
    }, (recommendedServices.length + 1) * 800);

    setConversationData({ ...conversationData, recommendedServices });
  };

  const handleRequirementsGathering = (userInput: string) => {
    const currentData = conversationData;

    if (!currentData.customerName) {
      setConversationData({ ...currentData, customerName: userInput });
      addBotMessage(`Prazer em conhecê-lo, ${userInput}! 

Agora preciso do seu CPF para dar continuidade ao processo. Digite apenas os números:`);
      return;
    }

    if (!currentData.customerCPF) {
      const cpf = userInput.replace(/\D/g, '');
      if (cpf.length !== 11) {
        addBotMessage("Por favor, digite um CPF válido com 11 dígitos:");
        return;
      }
      setConversationData({ ...currentData, customerCPF: cpf });
      addBotMessage(`Perfeito! Agora preciso do seu telefone para contato (com DDD):`);
      return;
    }

    if (!currentData.customerPhone) {
      const phone = userInput.replace(/\D/g, '');
      if (phone.length < 10) {
        addBotMessage("Por favor, digite um telefone válido com DDD:");
        return;
      }
      setConversationData({ ...currentData, customerPhone: phone });
      addBotMessage(`Ótimo! Por último, preciso do seu e-mail:`);
      return;
    }

    if (!currentData.customerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userInput)) {
        addBotMessage("Por favor, digite um e-mail válido:");
        return;
      }
      
      const finalData = { ...currentData, customerEmail: userInput };
      setConversationData(finalData);
      
      // Avançar para cálculo de taxa
      setTimeout(() => {
        addBotMessage(`Perfeito, ${finalData.customerName}! 

Agora vou calcular o valor final do seu documento. Um momento...`);
        
        setTimeout(() => {
          handleFeeCalculation(finalData);
        }, 2000);
      }, 500);
      
      setCurrentStep(CONVERSATION_STEPS.FEE_CALCULATION);
      return;
    }
  };

  const handleFeeCalculation = (data: any) => {
    const service = data.selectedService;
    const basePrice = service.base_price;
    const urgencyFee = 0; // Pode ser implementado depois
    const totalAmount = basePrice + urgencyFee;

    addBotMessage(`📋 **Resumo do Pedido**

**Documento:** ${service.name}
**Valor base:** ${formatPrice(basePrice)}
**Taxa de urgência:** ${formatPrice(urgencyFee)}
**Total:** ${formatPrice(totalAmount)}

**Prazo estimado:** ${service.estimated_days} dias úteis

Para confirmar o pedido, digite **CONFIRMAR**.
Para cancelar, digite **CANCELAR**.`);

    setConversationData({ 
      ...data, 
      totalAmount,
      basePrice,
      urgencyFee 
    });
    setCurrentStep(CONVERSATION_STEPS.ORDER_CREATION);
  };

  const handleOrderCreation = async (userInput: string) => {
    if (userInput.toUpperCase() === 'CONFIRMAR') {
      addBotMessage("Criando seu pedido... ⏳");
      
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .insert([{
            service_id: conversationData.selectedService.id,
            customer_name: conversationData.customerName,
            customer_email: conversationData.customerEmail,
            customer_phone: conversationData.customerPhone,
            customer_cpf: conversationData.customerCPF,
            total_amount: conversationData.totalAmount,
            document_data: conversationData,
            status: 'pending',
            payment_status: 'pending'
          }])
          .select()
          .single();

        if (error) throw error;

        addBotMessage(`✅ **Pedido criado com sucesso!**

**Número do pedido:** #${order.id.slice(-8).toUpperCase()}

Agora vamos para o pagamento. Você pode pagar via:
• 💳 Cartão de crédito/débito
• 🏦 PIX (desconto de 5%)

Digite **PIX** ou **CARTAO** para escolher a forma de pagamento:`);

        setConversationData({ ...conversationData, orderId: order.id });
        setCurrentStep(CONVERSATION_STEPS.CHECKOUT);

      } catch (error) {
        console.error('Erro ao criar pedido:', error);
        addBotMessage("Desculpe, ocorreu um erro ao criar seu pedido. Tente novamente em alguns instantes.");
      }
    } else if (userInput.toUpperCase() === 'CANCELAR') {
      addBotMessage("Pedido cancelado. Posso te ajudar com alguma outra coisa?");
      setCurrentStep(CONVERSATION_STEPS.SERVICE_SELECTION);
    } else {
      addBotMessage("Por favor, digite **CONFIRMAR** para confirmar o pedido ou **CANCELAR** para cancelar.");
    }
  };

  const handleCheckout = (userInput: string) => {
    const paymentMethod = userInput.toUpperCase();
    
    if (paymentMethod === 'PIX' || paymentMethod === 'CARTAO') {
      addBotMessage(`Perfeito! Abrindo o sistema de pagamento...`);
      
      // Abrir modal de pagamento
      setTimeout(() => {
        setShowPaymentModal(true);
      }, 1000);
      
      setCurrentStep(CONVERSATION_STEPS.STATUS_TRACKING);
    } else {
      addBotMessage("Por favor, digite **PIX** ou **CARTAO** para escolher a forma de pagamento.");
      return;
    }
  };

  const handleStatusTracking = (userInput: string) => {
    const input = userInput.toUpperCase();
    
    if (input === 'COMPROVANTE' || input === 'PAGO') {
      addBotMessage(`🎉 **Pagamento confirmado!**

Seu documento está em processamento. Você receberá atualizações por:
• 📧 E-mail: ${conversationData.customerEmail}
• 📱 WhatsApp: ${conversationData.customerPhone}

**Próximos passos:**
1. ✅ Pagamento confirmado
2. 🔄 Análise e coleta de documentos (1-2 dias)
3. 📋 Processamento no órgão oficial (${conversationData.selectedService.estimated_days} dias)
4. 📨 Entrega digital

Digite **STATUS** a qualquer momento para acompanhar seu pedido.

Obrigado por usar o MeusDocumentos.AI! 🚀`);

      // Salvar conversa
      saveConversation();
    } else if (input === 'STATUS') {
      addBotMessage(`📊 **Status do Pedido #${conversationData.orderId?.slice(-8).toUpperCase()}**

🔄 **Aguardando documentos adicionais**

Nossa equipe entrará em contato em breve para solicitar os documentos necessários.

Tempo restante estimado: ${conversationData.selectedService.estimated_days - 1} dias úteis`);
    } else {
      addBotMessage("Digite **STATUS** para acompanhar seu pedido ou faça uma nova pergunta.");
    }
  };

  const saveConversation = async () => {
    try {
      await supabase
        .from('conversations')
        .insert([{
          session_id: sessionId,
          messages: JSON.stringify(messages),
          current_step: currentStep,
          service_type: conversationData.selectedService?.category,
          collected_data: conversationData,
          status: 'completed'
        }]);
    } catch (error) {
      console.error('Erro ao salvar conversa:', error);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    addUserMessage(inputMessage);
    const userInput = inputMessage.trim();
    setInputMessage("");

    // Simular delay de resposta da IA
    setTimeout(() => {
      switch (currentStep) {
        case CONVERSATION_STEPS.SERVICE_SELECTION:
          handleServiceRecommendation(userInput);
          break;
        case CONVERSATION_STEPS.REQUIREMENTS_GATHERING:
          handleRequirementsGathering(userInput);
          break;
        case CONVERSATION_STEPS.ORDER_CREATION:
          handleOrderCreation(userInput);
          break;
        case CONVERSATION_STEPS.CHECKOUT:
          handleCheckout(userInput);
          break;
        case CONVERSATION_STEPS.STATUS_TRACKING:
          handleStatusTracking(userInput);
          break;
        default:
          addBotMessage("Desculpe, não entendi. Pode repetir?");
      }
    }, Math.random() * 1000 + 500); // Delay realístico
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-full p-2">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle>Assistente MeusDocumentos.AI</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Online - Resposta em segundos
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="flex-shrink-0">
                    {message.type === 'bot' ? (
                      <div className="bg-primary rounded-full p-1.5">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="bg-muted rounded-full p-1.5">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content.split('**').map((part, index) => 
                        index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                      )}
                    </div>
                    {message.service && (
                      <Card className="mt-2 border-0 bg-background/10">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-3 w-3" />
                              <span>{message.service.category}</span>
                            </div>
                            <div className="flex space-x-3">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span>{formatPrice(message.service.base_price)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{message.service.estimated_days}d</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              Step {currentStep}/8
            </Badge>
            {conversationData.selectedService && (
              <Badge variant="secondary" className="text-xs">
                {conversationData.selectedService.name}
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
      
      {conversationData.selectedService && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          serviceId={conversationData.selectedService.id}
          serviceName={conversationData.selectedService.name}
          amount={conversationData.totalAmount || 0}
          customerData={{
            name: conversationData.customerName || '',
            email: conversationData.customerEmail || '',
            phone: conversationData.customerPhone || '',
            cpf: conversationData.customerCPF || '',
            documentData: conversationData
          }}
        />
      )}
    </Dialog>
  );
};

export default ChatBot;