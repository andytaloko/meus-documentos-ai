import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OrderContext {
  id: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string;
  total_amount: number;
  estimated_completion_date: string;
  created_at: string;
  services: {
    name: string;
    category: string;
  } | null;
}

export interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  orderContext: OrderContext | null;
  setOrderContext: (context: OrderContext | null) => void;
  chatType: 'general' | 'order_specific' | 'support';
  setChatType: (type: 'general' | 'order_specific' | 'support') => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [orderContext, setOrderContext] = useState<OrderContext | null>(null);
  const [chatType, setChatType] = useState<'general' | 'order_specific' | 'support'>('general');

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        orderContext,
        setOrderContext,
        chatType,
        setChatType,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}