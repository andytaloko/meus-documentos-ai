import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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

interface ChatBotContextType {
  isOpen: boolean;
  messages: Message[];
  unreadCount: number;
  selectedService?: Service;
  currentStep: number;
  conversationData: any;
  sessionId: string;
  showPaymentModal: boolean;
  userProfile: any;
  setIsOpen: (open: boolean) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  addBotMessage: (content: string, service?: Service) => void;
  addUserMessage: (content: string) => void;
  markAsRead: () => void;
  clearMessages: () => void;
  initializeWithService: (service: Service) => void;
  handleUserInput: (input: string) => Promise<void>;
  setShowPaymentModal: (show: boolean) => void;
  formatPrice: (price: number) => string;
  isLoading: boolean;
  CONVERSATION_STEPS: typeof CONVERSATION_STEPS;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export function ChatBotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentStep, setCurrentStep] = useState(CONVERSATION_STEPS.GREETING);
  const [conversationData, setConversationData] = useState<any>({});
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();

  // Load conversation history and user profile when user logs in
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      loadConversationHistory();
    } else {
      // Clear messages when user logs out
      setMessages([]);
      setUnreadCount(0);
      setUserProfile(null);
      setCurrentStep(CONVERSATION_STEPS.GREETING);
      setConversationData({});
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const loadConversationHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (conversations && conversations.length > 0) {
        const lastConversation = conversations[0];
        const storedMessages = Array.isArray(lastConversation.messages) 
          ? lastConversation.messages 
          : typeof lastConversation.messages === 'string' 
            ? JSON.parse(lastConversation.messages) 
            : [];
        
        setMessages(storedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setCurrentStep(lastConversation.current_step || CONVERSATION_STEPS.GREETING);
        setConversationData(lastConversation.collected_data || {});
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random()}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    // Increment unread count if chat is closed and message is from bot
    if (!isOpen && message.type === 'bot') {
      setUnreadCount(prev => prev + 1);
    }

    // Auto-save conversation for logged-in users
    if (user && message.type === 'bot') {
      saveConversation([...messages, newMessage]);
    }
  };

  const addBotMessage = (content: string, service?: Service) => {
    addMessage({
      type: 'bot',
      content,
      service
    });
  };

  const addUserMessage = (content: string) => {
    addMessage({
      type: 'user',
      content
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const clearMessages = () => {
    setMessages([]);
    setUnreadCount(0);
    setCurrentStep(CONVERSATION_STEPS.GREETING);
    setConversationData({});
    setSelectedService(null);
  };

  const saveConversation = async (currentMessages: Message[]) => {
    if (!user) return;
    
    try {
      await supabase
        .from('conversations')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          messages: JSON.stringify(currentMessages),
          status: 'active',
          current_step: currentStep,
          collected_data: conversationData,
          service_type: selectedService?.category
        });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const initializeWithService = (service: Service) => {
    setSelectedService(service);
    clearMessages();
    
    // Add initial service message
    const initialMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type: 'bot',
      content: `Olá! 👋 Vejo que você está interessado em solicitar: **${service.name}**`,
      timestamp: new Date(),
      service
    };
    
    setMessages([initialMessage]);
    
    // Set up conversation for this service
    setTimeout(() => {
      if (user && userProfile) {
        addBotMessage(`Este documento tem um custo a partir de **${formatPrice(service.base_price)}** e prazo estimado de **${service.estimated_days} dias úteis**.

Olá, ${userProfile.display_name || user.email?.split('@')[0]}! Como você já está logado, vou usar suas informações salvas.

Confirma os dados abaixo?
• **Nome:** ${userProfile.display_name}
• **CPF:** ${userProfile.cpf ? `${userProfile.cpf.slice(0,3)}.${userProfile.cpf.slice(3,6)}.${userProfile.cpf.slice(6,9)}-${userProfile.cpf.slice(9)}` : 'Não informado'}
• **Telefone:** ${userProfile.phone || 'Não informado'}
• **Email:** ${user.email}

Digite **CONFIRMAR** para usar estes dados ou **ALTERAR** para informar outros dados:`);
        
        setConversationData({ 
          selectedService: service,
          customerName: userProfile.display_name,
          customerCPF: userProfile.cpf,
          customerPhone: userProfile.phone,
          customerEmail: user.email,
          userAuthenticated: true
        });
        setCurrentStep(CONVERSATION_STEPS.FEE_CALCULATION);
      } else {
        addBotMessage(`Este documento tem um custo a partir de **${formatPrice(service.base_price)}** e prazo estimado de **${service.estimated_days} dias úteis**.

Para começar, preciso de algumas informações básicas. Qual é o seu nome completo?`);
        setCurrentStep(CONVERSATION_STEPS.REQUIREMENTS_GATHERING);
        setConversationData({ selectedService: service });
      }
    }, 1000);
    
    setIsOpen(true);
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
      service.description?.toLowerCase().includes(keywords)
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

    // Handle authenticated user data confirmation
    if (currentData.userAuthenticated) {
      const input = userInput.toUpperCase();
      if (input === 'CONFIRMAR') {
        addBotMessage(`Perfeito! Vou calcular o valor final do seu documento. Um momento...`);
        setTimeout(() => {
          handleFeeCalculation(currentData);
        }, 2000);
        setCurrentStep(CONVERSATION_STEPS.FEE_CALCULATION);
        return;
      } else if (input === 'ALTERAR') {
        addBotMessage(`Sem problemas! Vamos atualizar seus dados.

Qual é o seu nome completo?`);
        setConversationData({ ...currentData, userAuthenticated: false, customerName: '', customerCPF: '', customerPhone: '', customerEmail: '' });
        return;
      } else {
        addBotMessage("Por favor, digite **CONFIRMAR** para usar os dados salvos ou **ALTERAR** para informar outros dados.");
        return;
      }
    }

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
            payment_status: 'pending',
            user_id: user?.id || null
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
    } else if (input === 'STATUS') {
      addBotMessage(`📊 **Status do Pedido #${conversationData.orderId?.slice(-8).toUpperCase()}**

🔄 **Aguardando documentos adicionais**

Nossa equipe entrará em contato em breve para solicitar os documentos necessários.

Tempo restante estimado: ${conversationData.selectedService.estimated_days - 1} dias úteis`);
    } else {
      addBotMessage("Digite **STATUS** para acompanhar seu pedido ou faça uma nova pergunta.");
    }
  };

  const handleUserInput = async (input: string) => {
    const userInput = input.trim();
    
    // Add user message first
    addUserMessage(userInput);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    switch (currentStep) {
      case CONVERSATION_STEPS.SERVICE_SELECTION:
        await handleServiceRecommendation(userInput);
        break;
      case CONVERSATION_STEPS.REQUIREMENTS_GATHERING:
        handleRequirementsGathering(userInput);
        break;
      case CONVERSATION_STEPS.ORDER_CREATION:
        await handleOrderCreation(userInput);
        break;
      case CONVERSATION_STEPS.CHECKOUT:
        handleCheckout(userInput);
        break;
      case CONVERSATION_STEPS.STATUS_TRACKING:
        handleStatusTracking(userInput);
        break;
      default:
        // Handle service selection from recommendations
        if (conversationData.recommendedServices) {
          const serviceIndex = parseInt(userInput) - 1;
          if (serviceIndex >= 0 && serviceIndex < conversationData.recommendedServices.length) {
            const service = conversationData.recommendedServices[serviceIndex];
            initializeWithService(service);
            return;
          }
        }
        
        // Default greeting response
        if (currentStep === CONVERSATION_STEPS.GREETING) {
          addBotMessage(`Olá! 👋 Sou o assistente virtual do **MeusDocumentos.AI**. 

Estou aqui para te ajudar a solicitar documentos oficiais de forma rápida e segura.

Que tipo de documento você precisa?`);
          setCurrentStep(CONVERSATION_STEPS.SERVICE_SELECTION);
        } else {
          addBotMessage("Desculpe, não entendi. Pode repetir ou usar um dos comandos sugeridos?");
        }
    }
  };

  const value: ChatBotContextType = {
    isOpen,
    messages,
    unreadCount,
    selectedService,
    currentStep,
    conversationData,
    sessionId,
    showPaymentModal,
    userProfile,
    setIsOpen,
    addMessage,
    addBotMessage,
    addUserMessage,
    markAsRead,
    clearMessages,
    initializeWithService,
    handleUserInput,
    setShowPaymentModal,
    formatPrice,
    isLoading,
    CONVERSATION_STEPS
  };

  return (
    <ChatBotContext.Provider value={value}>
      {children}
    </ChatBotContext.Provider>
  );
}

export function useChatBot() {
  const context = useContext(ChatBotContext);
  if (context === undefined) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
}