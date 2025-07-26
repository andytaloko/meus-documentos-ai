import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatBot from "@/components/ChatBot";

export default function FloatingChatTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setOpen(true)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            "bg-primary hover:bg-primary/90"
          )}
          size="lg"
          aria-label="Open Chat"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>

      <ChatBot 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        selectedService={null}
      />
    </>
  );
}