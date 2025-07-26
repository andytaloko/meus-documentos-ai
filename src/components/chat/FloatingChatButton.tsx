import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChatBot } from "@/contexts/ChatBotContext";
import { cn } from "@/lib/utils";

export function FloatingChatButton() {
  const { isOpen, setIsOpen, unreadCount, markAsRead } = useChatBot();

  const handleToggle = () => {
    if (!isOpen) {
      markAsRead();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Button
          onClick={handleToggle}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            isOpen 
              ? "bg-destructive hover:bg-destructive/90" 
              : "bg-primary hover:bg-primary/90"
          )}
          size="lg"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </Button>
        
        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs animate-bounce"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
        
        {/* Pulse effect for new messages */}
        {unreadCount > 0 && !isOpen && (
          <div className="absolute inset-0 w-14 h-14 rounded-full bg-primary/20 animate-ping" />
        )}
      </div>
    </div>
  );
}