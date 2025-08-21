import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, X, FileText, Clock, DollarSign, Upload, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useChat, OrderContext } from "@/contexts/ChatContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { TypingIndicator } from "./chat/TypingIndicator";
import { QuickReplies } from "./chat/QuickReplies";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
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
  orderContext?: OrderContext | null;
}

const CONVERSATION_STEPS = {
  GREETING: 1,
  SERVICE_SELECTION: 2,
  DOCUMENT_ANALYSIS: 3,
  REQUIREMENTS_GATHERING: 4,
  FEE_CALCULATION: 5,
  ORDER_CREATION: 6,
  CHECKOUT: 7,
  STATUS_TRACKING: 8,
  ORDER_STATUS_INQUIRY: 9,
  DOCUMENT_UPLOAD: 10,
  ORDER_UPDATE_REQUEST: 11
};

const ChatBot = ({ isOpen, onClose, selectedService, orderContext }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(CONVERSATION_STEPS.GREETING);
  const [conversationData, setConversationData] = useState<any>({});
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [quickReplies, setQuickReplies] = useState<Array<{id: string, label: string, value: string, icon?: React.ReactNode}>>([]);
  const { user } = useAuth();
  const { chatType } = useChat();
  const isMobile = useIsMobile();
  const { isTyping, setIsTyping } = useTypingIndicator();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        fetchUserProfile();
      }
      initializeConversation();
    }
  }, [isOpen, selectedService, orderContext, user]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(profile);

      // Fetch conversation history for logged-in users
      if (user?.id) {
        const { data: conversations } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (conversations && conversations.length > 0) {
          const lastConversation = conversations[0];
          const storedMessages = Array.isArray(lastConversation.messages) ? lastConversation.messages : 
                                   typeof lastConversation.messages === 'string' ? JSON.parse(lastConversation.messages) : [];
          
          // Ensure all timestamps are converted to Date objects
          const normalizedMessages = storedMessages.map((msg: any) => ({
            ...msg,
            timestamp: typeof msg.timestamp === 'number' ? new Date(msg.timestamp) : 
                      typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : 
                      msg.timestamp instanceof Date ? msg.timestamp : new Date()
          }));
          
          setMessages(normalizedMessages);
          setCurrentStep(lastConversation.current_step || 1);
          setConversationData(lastConversation.collected_data || {});
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const initializeConversation = () => {
    const welcomeMessages: Message[] = [];
    setQuickReplies([]);

    if (orderContext) {
      // Order-specific chat flow
      welcomeMessages.push({
        id: `msg_${Date.now()}`,
        type: 'bot',
        content: `Olá! 👋 Estou aqui para ajudar com seu pedido **#${orderContext.id.slice(-8).toUpperCase()}**.

**${orderContext.services?.name || 'Serviço'}**
**Status atual:** ${getStatusLabel(orderContext.status)}
**Pagamento:** ${orderContext.payment_status === 'paid' ? 'Pago ✅' : 'Pendente ⏳'}

Como posso te ajudar hoje?`,
        timestamp: new Date()
      });

      setQuickReplies([
        { id: 'status', label: 'Ver Status', value: 'STATUS', icon: <CheckCircle className="w-3 h-3" /> },
        { id: 'upload', label: 'Enviar Docs', value: 'UPLOAD', icon: <Upload className="w-3 h-3" /> },
        { id: 'update', label: 'Solicitar Update', value: 'UPDATE' }
      ]);

      setCurrentStep(CONVERSATION_STEPS.ORDER_STATUS_INQUIRY);
      setConversationData({ orderContext });
    } else if (selectedService) {
      welcomeMessages.push({
        id: `msg_${Date.now()}`,
        type: 'bot',
        content: `Olá! 👋 Vejo que você está interessado em solicitar: **${selectedService.name}**`,
        timestamp: new Date(),
        service: selectedService
      });

      setTimeout(() => {
        if (user && userProfile) {
          addBotMessage(`Este documento tem um custo a partir de **R$ ${formatPrice(selectedService.base_price)}** e prazo estimado de **${selectedService.estimated_days} dias úteis**.

Olá, ${userProfile.display_name || user.email?.split('@')[0]}! Como você já está logado, vou usar suas informações salvas.

Confirma os dados abaixo?
• **Nome:** ${userProfile.display_name}
• **CPF:** ${userProfile.cpf ? `${userProfile.cpf.slice(0,3)}.${userProfile.cpf.slice(3,6)}.${userProfile.cpf.slice(6,9)}-${userProfile.cpf.slice(9)}` : 'Não informado'}
• **Telefone:** ${userProfile.phone || 'Não informado'}
• **Email:** ${user.email}

Digite **CONFIRMAR** para usar estes dados ou **ALTERAR** para informar outros dados:`);
          
          setConversationData({ 
            selectedService,
            customerName: userProfile.display_name,
            customerCPF: userProfile.cpf,
            customerPhone: userProfile.phone,
            customerEmail: user.email,
            userAuthenticated: true
          });
          setCurrentStep(CONVERSATION_STEPS.FEE_CALCULATION);
        } else {
          addBotMessage(`Este documento tem um custo a partir de **R$ ${formatPrice(selectedService.base_price)}** e prazo estimado de **${selectedService.estimated_days} dias úteis**.

Para começar, preciso de algumas informações básicas. Qual é o seu nome completo?`);
          setCurrentStep(CONVERSATION_STEPS.REQUIREMENTS_GATHERING);
          setConversationData({ selectedService });
        }
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

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pendente',
      processing: 'Em Processamento',
      documents_requested: 'Documentos Solicitados',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const handleOrderStatusInquiry = async (userInput: string) => {
    const input = userInput.toUpperCase();
    
    if (input === 'STATUS') {
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(`📊 **Status Detalhado do Pedido #${orderContext?.id.slice(-8).toUpperCase()}**

**Documento:** ${orderContext?.services?.name}
**Status:** ${getStatusLabel(orderContext?.status || '')}
**Pagamento:** ${orderContext?.payment_status === 'paid' ? 'Confirmado ✅' : 'Pendente ⏳'}
**Valor:** ${formatPrice(orderContext?.total_amount || 0)}
**Data do Pedido:** ${new Date(orderContext?.created_at || '').toLocaleDateString('pt-BR')}
**Previsão:** ${orderContext?.estimated_completion_date 
  ? new Date(orderContext.estimated_completion_date).toLocaleDateString('pt-BR')
  : 'A definir'}

${getStatusDescription(orderContext?.status || '')}`);

        setQuickReplies([
          { id: 'upload', label: 'Enviar Documentos', value: 'UPLOAD', icon: <Upload className="w-3 h-3" /> },
          { id: 'update', label: 'Solicitar Atualização', value: 'UPDATE' },
          { id: 'help', label: 'Mais Ajuda', value: 'HELP' }
        ]);
      }, 1500);
    } else if (input === 'UPLOAD') {
      setCurrentStep(CONVERSATION_STEPS.DOCUMENT_UPLOAD);
      addBotMessage(`📤 **Upload de Documentos**

Para enviar documentos para seu pedido, você pode:

1. **📧 Por E-mail:** Envie para documentos@meusdocumentos.ai com o assunto "Pedido #${orderContext?.id.slice(-8).toUpperCase()}"

2. **📱 Por WhatsApp:** (11) 9999-9999

3. **💬 Aqui no Chat:** Descreva quais documentos você tem disponíveis

Que tipo de documento você gostaria de enviar?`);

      setQuickReplies([
        { id: 'email', label: 'Enviar por E-mail', value: 'EMAIL' },
        { id: 'whatsapp', label: 'Enviar por WhatsApp', value: 'WHATSAPP' },
        { id: 'describe', label: 'Descrever Aqui', value: 'DESCRIBE' }
      ]);
    } else if (input === 'UPDATE') {
      setCurrentStep(CONVERSATION_STEPS.ORDER_UPDATE_REQUEST);
      addBotMessage(`🔄 **Solicitar Atualização**

Vou registrar sua solicitação de atualização para o pedido #${orderContext?.id.slice(-8).toUpperCase()}.

Nossa equipe será notificada e entrará em contato em até 24 horas úteis.

Gostaria de adicionar alguma observação específica sobre sua solicitação?`);

      setQuickReplies([
        { id: 'urgent', label: 'É Urgente', value: 'URGENT' },
        { id: 'normal', label: 'Prazo Normal', value: 'NORMAL' },
        { id: 'question', label: 'Tenho Dúvidas', value: 'QUESTION' }
      ]);
    } else {
      addBotMessage("Como posso te ajudar com seu pedido? Digite **STATUS** para ver informações detalhadas, **UPLOAD** para enviar documentos ou **UPDATE** para solicitar uma atualização.");
    }
  };

  const getStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
      pending: '⏳ Seu pedido foi recebido e está na fila de processamento.',
      processing: '🔄 Nossa equipe está analisando seu pedido e coletando informações.',
      documents_requested: '📋 Documentos adicionais são necessários. Verifique seu e-mail.',
      in_progress: '⚡ Seu documento está sendo processado no órgão oficial.',
      completed: '🎉 Seu documento está pronto! Verifique seu e-mail.',
      cancelled: '❌ Este pedido foi cancelado.'
    };
    return descriptions[status] || '';
  };

  const handleDocumentUpload = (userInput: string) => {
    const input = userInput.toUpperCase();
    
    if (input === 'EMAIL') {
      addBotMessage(`📧 **Envio por E-mail**

Envie seus documentos para:
**documentos@meusdocumentos.ai**

**Assunto obrigatório:** Pedido #${orderContext?.id.slice(-8).toUpperCase()}

**Formatos aceitos:** PDF, JPG, PNG (máx. 10MB cada)

Você receberá uma confirmação automática quando os documentos forem recebidos.`);
    } else if (input === 'WHATSAPP') {
      addBotMessage(`📱 **Envio por WhatsApp**

Envie seus documentos para:
**(11) 9999-9999**

**Mencione:** Pedido #${orderContext?.id.slice(-8).toUpperCase()}

Nossa equipe confirmará o recebimento em até 1 hora.`);
    } else if (input === 'DESCRIBE') {
      addBotMessage(`💬 **Descrever Documentos**

Descreva quais documentos você tem disponíveis para o pedido #${orderContext?.id.slice(-8).toUpperCase()}:

Exemplo: "Tenho RG, CPF e comprovante de residência em PDF"`);
      
      setCurrentStep(CONVERSATION_STEPS.REQUIREMENTS_GATHERING);
    } else {
      addBotMessage("Selecione uma forma de envio dos documentos.");
    }
  };

  const handleOrderUpdateRequest = async (userInput: string) => {
    const input = userInput.toUpperCase();
    
    try {
      // Save update request to database
      await supabase
        .from('conversations')
        .insert([{
          session_id: sessionId,
          messages: JSON.stringify([...messages, { 
            type: 'user', 
            content: userInput, 
            timestamp: new Date() 
          }]),
          current_step: currentStep,
          conversation_type: 'order_specific',
          order_id: orderContext?.id,
          collected_data: { ...conversationData, updateRequest: userInput, priority: input },
          status: 'active',
          user_id: user?.id || null
        }]);

      if (input === 'URGENT') {
        addBotMessage(`⚡ **Solicitação Urgente Registrada**

Sua solicitação foi marcada como **URGENTE**.

Nossa equipe será notificada imediatamente e entrará em contato em até **4 horas úteis**.

Pedido: #${orderContext?.id.slice(-8).toUpperCase()}`);
      } else if (input === 'NORMAL') {
        addBotMessage(`✅ **Solicitação Registrada**

Sua solicitação foi registrada com prioridade normal.

Nossa equipe entrará em contato em até **24 horas úteis**.

Pedido: #${orderContext?.id.slice(-8).toUpperCase()}`);
      } else {
        addBotMessage(`❓ **Dúvida Registrada**

Sua dúvida foi registrada: "${userInput}"

Nossa equipe responderá em até **24 horas úteis**.

Pedido: #${orderContext?.id.slice(-8).toUpperCase()}`);
      }

      setQuickReplies([
        { id: 'status', label: 'Ver Status', value: 'STATUS' },
        { id: 'new', label: 'Nova Solicitação', value: 'NEW' }
      ]);

    } catch (error) {
      console.error('Error saving update request:', error);
      addBotMessage("Desculpe, ocorreu um erro ao registrar sua solicitação. Tente novamente em alguns instantes.");
    }
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
          conversation_type: chatType,
          order_id: orderContext?.id || null,
          collected_data: conversationData,
          status: 'completed',
          user_id: user?.id || null
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
        case CONVERSATION_STEPS.ORDER_STATUS_INQUIRY:
          handleOrderStatusInquiry(userInput);
          break;
        case CONVERSATION_STEPS.DOCUMENT_UPLOAD:
          handleDocumentUpload(userInput);
          break;
        case CONVERSATION_STEPS.ORDER_UPDATE_REQUEST:
          handleOrderUpdateRequest(userInput);
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
                      {/* Ensure timestamp is a Date object before calling toLocaleTimeString */}
                      {(message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <TypingIndicator visible={isTyping} />
          </div>
        </ScrollArea>

        <div className="border-t">
          {quickReplies.length > 0 && (
            <QuickReplies
              replies={quickReplies}
              onReply={(value) => {
                setInputMessage(value);
                setTimeout(() => handleSendMessage(), 100);
              }}
              className="border-b"
            />
          )}
          <div className="p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={orderContext ? "Pergunte sobre seu pedido..." : "Digite sua mensagem..."}
                className="flex-1"
                disabled={isTyping}
              />
              <Button onClick={handleSendMessage} size="icon" disabled={isTyping || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2 px-4 pb-2">
              <Badge variant="outline" className="text-xs">
                Step {currentStep}/11
              </Badge>
              {conversationData.selectedService && (
                <Badge variant="secondary" className="text-xs">
                  {conversationData.selectedService.name}
                </Badge>
              )}
              {orderContext && (
                <Badge variant="default" className="text-xs">
                  Pedido #{orderContext.id.slice(-8).toUpperCase()}
                </Badge>
              )}
            </div>
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
