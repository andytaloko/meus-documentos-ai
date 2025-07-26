import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  service?: any;
}

interface ChatBotContextType {
  isOpen: boolean;
  messages: Message[];
  unreadCount: number;
  selectedService?: any;
  setIsOpen: (open: boolean) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  markAsRead: () => void;
  clearMessages: () => void;
  initializeWithService: (service: any) => void;
  isLoading: boolean;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export function ChatBotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const { user } = useAuth();

  // Load conversation history when user logs in
  useEffect(() => {
    if (user) {
      loadConversationHistory();
    } else {
      // Clear messages when user logs out
      setMessages([]);
      setUnreadCount(0);
    }
  }, [user]);

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

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const clearMessages = () => {
    setMessages([]);
    setUnreadCount(0);
  };

  const saveConversation = async (currentMessages: Message[]) => {
    if (!user) return;
    
    try {
      await supabase
        .from('conversations')
        .upsert({
          user_id: user.id,
          session_id: `session_${user.id}_${Date.now()}`,
          messages: JSON.stringify(currentMessages),
          status: 'active',
          current_step: 1,
          collected_data: {}
        });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const initializeWithService = (service: any) => {
    setSelectedService(service);
    clearMessages();
    
    // Add initial service message
    const initialMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type: 'bot',
      content: `Olá! 👋 Vejo que você tem interesse no serviço **${service.name}**.

Como posso te ajudar com este serviço? Posso:
• Explicar o processo
• Listar os documentos necessários  
• Calcular o valor total
• Iniciar seu pedido

O que você gostaria de saber? 😊`,
      timestamp: new Date(),
      service
    };
    
    setMessages([initialMessage]);
    setIsOpen(true);
  };

  const value: ChatBotContextType = {
    isOpen,
    messages,
    unreadCount,
    selectedService,
    setIsOpen,
    addMessage,
    markAsRead,
    clearMessages,
    initializeWithService,
    isLoading
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