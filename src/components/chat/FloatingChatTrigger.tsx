import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat, OrderContext } from "@/contexts/ChatContext";
import ChatBot from "@/components/ChatBot";

interface FloatingChatTriggerProps {
  orderContext?: OrderContext | null;
  position?: 'fixed' | 'relative';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function FloatingChatTrigger({ 
  orderContext, 
  position = 'fixed',
  size = 'lg',
  showLabel = false,
  className 
}: FloatingChatTriggerProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const { isOpen, setIsOpen, setOrderContext, setChatType } = useChat();

  const handleOpenChat = () => {
    if (orderContext) {
      setOrderContext(orderContext);
      setChatType('order_specific');
    } else {
      setOrderContext(null);
      setChatType('general');
    }
    
    if (position === 'fixed') {
      setIsOpen(true);
    } else {
      setLocalOpen(true);
    }
  };

  const handleCloseChat = () => {
    if (position === 'fixed') {
      setIsOpen(false);
    } else {
      setLocalOpen(false);
    }
    setOrderContext(null);
    setChatType('general');
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-14 h-14"
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6"
  };

  const positionClasses = position === 'fixed' 
    ? "fixed bottom-6 right-6 z-50" 
    : "relative";

  const chatIsOpen = position === 'fixed' ? isOpen : localOpen;

  return (
    <>
      <div className={cn(positionClasses, className)}>
        <Button
          onClick={handleOpenChat}
          className={cn(
            sizeClasses[size],
            "rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            "bg-primary hover:bg-primary/90",
            showLabel && "px-4 rounded-lg w-auto h-10"
          )}
          size={showLabel ? "sm" : (size === 'md' ? 'sm' : size)}
          aria-label={orderContext ? "Chat sobre pedido" : "Abrir Chat"}
        >
          <MessageSquare className={cn(iconSizeClasses[size], showLabel && "mr-2")} />
          {showLabel && (
            <span className="text-xs font-medium">
              {orderContext ? "Assistente" : "Chat"}
            </span>
          )}
        </Button>
      </div>

      {position === 'relative' && (
        <ChatBot 
          isOpen={chatIsOpen} 
          onClose={handleCloseChat} 
          selectedService={null}
          orderContext={orderContext}
        />
      )}
    </>
  );
}