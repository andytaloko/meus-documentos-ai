import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  orderId?: string;
  read: boolean;
}

interface QuickCommand {
  command: string;
  description: string;
  action: (args?: string) => void;
}

export function usePersistentChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // Quick commands
  const commands: QuickCommand[] = [
    {
      command: '/help',
      description: 'Mostrar comandos disponíveis',
      action: () => addBotMessage('Comandos disponíveis:\n/status - Verificar status dos pedidos\n/help - Mostrar esta ajuda')
    },
    {
      command: '/status',
      description: 'Verificar status dos pedidos',
      action: () => addBotMessage('Verificando status dos seus pedidos...')
    },
    {
      command: '/clear',
      description: 'Limpar conversa',
      action: () => setMessages([])
    }
  ];

  const addMessage = useCallback((content: string, isBot = false, orderId?: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      isBot,
      timestamp: new Date(),
      orderId,
      read: isBot ? false : true
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Auto-save after 2 seconds
    if (user && !autoSaveTimer.current) {
      autoSaveTimer.current = setTimeout(() => {
        saveConversation();
        autoSaveTimer.current = undefined;
      }, 2000);
    }

    return newMessage;
  }, [user]);

  const addBotMessage = useCallback((content: string, orderId?: string) => {
    return addMessage(content, true, orderId);
  }, [addMessage]);

  const processCommand = useCallback((input: string) => {
    const [command, ...args] = input.trim().split(' ');
    const quickCommand = commands.find(cmd => cmd.command === command);
    
    if (quickCommand) {
      quickCommand.action(args.join(' '));
      return true;
    }
    return false;
  }, [commands]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Check for quick commands
    if (content.startsWith('/')) {
      const isCommand = processCommand(content);
      if (isCommand) {
        addMessage(content);
        return;
      }
    }

    addMessage(content);
    setIsLoading(true);

    try {
      // Simulate bot response (replace with actual API call)
      setTimeout(() => {
        const responses = [
          'Entendi sua solicitação! Como posso ajudar mais?',
          'Vou verificar isso para você. Um momento...',
          'Obrigado pela mensagem! Estou aqui para ajudar.',
          'Vou processar sua solicitação e retorno em breve.'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addBotMessage(randomResponse);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem. Tente novamente.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [addMessage, addBotMessage, processCommand]);

  const markAsRead = useCallback(() => {
    setMessages(prev => 
      prev.map(msg => ({ ...msg, read: true }))
    );
  }, []);

  const getUnreadCount = useCallback(() => {
    return messages.filter(msg => msg.isBot && !msg.read).length;
  }, [messages]);

  const saveConversation = useCallback(async () => {
    if (!user || messages.length === 0) return;

    try {
      // For now, just store in localStorage since the Supabase schema isn't ready
      localStorage.setItem(`chat_${user.id}`, JSON.stringify(messages));
      setIsConnected(true);

    } catch (error) {
      console.error('Error saving conversation:', error);
      setIsConnected(false);
    }
  }, [user, messages]);

  const loadConversation = useCallback(async () => {
    if (!user) return;

    try {
      // For now, load from localStorage since the Supabase schema isn't ready
      const saved = localStorage.getItem(`chat_${user.id}`);
      if (saved) {
        const parsedMessages = JSON.parse(saved);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }, [user]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    if (user) {
      saveConversation();
    }
  }, [user, saveConversation]);

  // Load conversation when user logs in
  useEffect(() => {
    if (user) {
      loadConversation();
    } else {
      setMessages([]);
    }
  }, [user, loadConversation]);

  // Auto-save on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        saveConversation();
      }
    };
  }, [saveConversation]);

  return {
    messages,
    isLoading,
    isConnected,
    commands,
    sendMessage,
    addMessage,
    addBotMessage,
    markAsRead,
    getUnreadCount,
    clearConversation,
    saveConversation
  };
}