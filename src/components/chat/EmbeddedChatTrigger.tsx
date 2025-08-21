import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatBot from "@/components/ChatBot";
import { OrderContext } from "@/contexts/ChatContext";

interface EmbeddedChatTriggerProps {
  orderContext?: OrderContext | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function EmbeddedChatTrigger({ 
  orderContext, 
  size = 'sm',
  showLabel = false,
  className 
}: EmbeddedChatTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          sizeClasses[size],
          "rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-primary hover:bg-primary/90",
          showLabel && "px-4 rounded-lg w-auto h-8",
          className
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

      <ChatBot 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        selectedService={null}
        orderContext={orderContext}
      />
    </>
  );
}