import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, X, Loader2 } from "lucide-react";
import { useChatBot } from "@/contexts/ChatBotContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function ChatPanel() {
  const { 
    isOpen, 
    setIsOpen, 
    messages, 
    addMessage, 
    isLoading,
    markAsRead 
  } = useChatBot();
  
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen, markAsRead]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    // Add user message
    addMessage({
      type: 'user',
      content: userMessage
    });

    // Simulate bot response
    setIsTyping(true);
    
    setTimeout(() => {
      const response = generateBotResponse(userMessage);
      addMessage({
        type: 'bot',
        content: response
      });
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Status queries
    if (input.includes('status') || input.includes('pedido')) {
      return `📊 **Seus Pedidos Ativos**

Para verificar o status específico de um pedido, você pode:
• Consultar a dashboard principal
• Me informar o número do pedido
• Acessar seu perfil

Como posso te ajudar especificamente? 🤔`;
    }
    
    // Profile/data updates
    if (input.includes('email') || input.includes('telefone') || input.includes('dados')) {
      return `📝 **Atualização de Dados**

Para atualizar seus dados pessoais:
1. Acesse seu **Perfil** no menu superior
2. Edite as informações necessárias
3. Salve as alterações

Suas informações são protegidas e apenas você pode alterá-las. 🔒`;
    }
    
    // Payment help
    if (input.includes('pagamento') || input.includes('pagar')) {
      return `💳 **Ajuda com Pagamentos**

**Formas de pagamento disponíveis:**
• PIX (desconto de 5%)
• Cartão de crédito/débito

**Problemas com pagamento?**
• Verifique os dados do cartão
• Confirme se há limite disponível
• Tente novamente em alguns minutos

Precisa de mais ajuda? Me diga qual é o problema específico! 💪`;
    }
    
    // General help
    if (input.includes('ajuda') || input.includes('help')) {
      return `🤝 **Como posso te ajudar?**

**Principais tópicos:**
• 📋 Status de pedidos
• 💳 Ajuda com pagamentos  
• 📝 Atualização de dados
• 📞 Novo pedido
• ❓ Dúvidas gerais

Digite sua dúvida ou escolha um dos tópicos acima! 😊`;
    }
    
    // Default response
    return `Olá! 👋 

Entendi que você quer saber sobre: **"${userInput}"**

Posso te ajudar com:
• Status de pedidos
• Informações de pagamento
• Atualização de dados pessoais
• Fazer novos pedidos

Me diga como posso te ajudar melhor! 😊`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  // Mobile: Full screen modal
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40 bg-background">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Assistente Virtual</h3>
                <p className="text-xs text-muted-foreground">
                  {isTyping ? "Digitando..." : "Online"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Olá, {user?.email?.split('@')[0]}! 👋
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Como posso te ajudar hoje?
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex gap-3",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}>
                  {message.type === 'bot' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-lg",
                    message.type === 'user' 
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  )}>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Digitando...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Side panel
  return (
    <div className="fixed bottom-24 right-6 z-40 w-96">
      <Card className="shadow-2xl border-2">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">Assistente Virtual</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {isTyping ? "Digitando..." : "Online"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Olá, {user?.email?.split('@')[0]}! 👋
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Como posso te ajudar hoje?
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex gap-3",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}>
                  {message.type === 'bot' && (
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-lg text-sm",
                    message.type === 'user' 
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}>
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback>
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs text-muted-foreground">
                        Digitando...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                className="flex-1 text-sm"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}