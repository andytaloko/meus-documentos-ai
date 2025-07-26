import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  User, 
  LogIn, 
  MessageCircle, 
  Menu, 
  X,
  Search,
  ChevronDown,
  Shield,
  Clock,
  Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useChatBot } from "@/contexts/ChatBotContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { SearchDialog } from "@/components/ui/search-dialog";
import { cn } from "@/lib/utils";

interface NavigationHeaderProps {
  onServiceSelect?: (service: any) => void;
}

const popularServices = [
  { id: "1", name: "CPF", category: "Documentos Pessoais", description: "Segunda via do CPF", base_price: 1500, estimated_days: 2 },
  { id: "2", name: "Certidão de Nascimento", category: "Documentos Pessoais", description: "Segunda via da certidão", base_price: 2000, estimated_days: 3 },
  { id: "3", name: "Antecedentes Criminais", category: "Segurança", description: "Certidão de antecedentes", base_price: 1200, estimated_days: 1 },
];

export function NavigationHeader({ onServiceSelect }: NavigationHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuth();
  const { isMobile } = useResponsiveLayout();
  const { setIsOpen: setChatOpen } = useChatBot();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleStartChat = () => {
    setChatOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleServiceSelect = (service: any) => {
    if (onServiceSelect) {
      onServiceSelect(service);
    }
    setChatOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary to-primary-glow rounded-lg p-2 hover-scale">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  MeusDocumentos.AI
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Documentos oficiais com IA
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <NavigationMenu className="hidden lg:flex">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="h-10">
                      <FileText className="h-4 w-4 mr-2" />
                      Serviços
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[400px]">
                        <div className="grid gap-1">
                          <h4 className="text-sm font-medium leading-none">Documentos Populares</h4>
                          <p className="text-sm text-muted-foreground">
                            Os documentos mais solicitados
                          </p>
                        </div>
                        {popularServices.map((service) => (
                          <NavigationMenuLink
                            key={service.id}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                            onClick={() => handleServiceSelect(service)}
                          >
                            <div className="text-sm font-medium leading-none">{service.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <Badge variant="secondary" className="text-xs">
                                R$ {(service.base_price / 100).toFixed(2)}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.estimated_days}d
                              </span>
                            </div>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {user && (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-10">
                        <User className="h-4 w-4 mr-2" />
                        Minha Conta
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid gap-3 p-6 w-[300px]">
                          <NavigationMenuLink
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                            onClick={() => handleNavigation('/dashboard')}
                          >
                            <div className="text-sm font-medium leading-none">Dashboard</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Acompanhe seus pedidos
                            </p>
                          </NavigationMenuLink>
                          <NavigationMenuLink
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                            onClick={() => handleNavigation('/profile')}
                          >
                            <div className="text-sm font-medium leading-none">Perfil</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Gerencie suas informações
                            </p>
                          </NavigationMenuLink>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            )}

            {/* Desktop Actions */}
            {!isMobile && (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="hover-scale"
                >
                  <Search className="h-4 w-4" />
                </Button>

                {user && (
                  <div className="hidden sm:block">
                    <NotificationCenter />
                  </div>
                )}

                {user ? (
                  <>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigation('/dashboard')}
                      className={cn(
                        "hover-scale",
                        isActive('/dashboard') && "bg-accent"
                      )}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button 
                      onClick={handleStartChat}
                      size="sm"
                      className="hover-scale bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Novo Pedido
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigation('/auth/login')}
                      className="hover-scale"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Entrar
                    </Button>
                    <Button 
                      onClick={handleStartChat}
                      size="sm"
                      className="hover-scale bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Assistente
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <div className="flex items-center gap-2">
                {user && (
                  <NotificationCenter />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="hover-scale"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          {isMobile && isMobileMenuOpen && (
            <div className="lg:hidden border-t bg-background/95 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Search */}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Search className="h-4 w-4 mr-3" />
                  Buscar serviços
                </Button>

                {/* Services */}
                <div className="py-2">
                  <h3 className="px-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Serviços Populares
                  </h3>
                  {popularServices.map((service) => (
                    <Button
                      key={service.id}
                      variant="ghost"
                      className="w-full justify-start mt-1"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <FileText className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-muted-foreground">
                          R$ {(service.base_price / 100).toFixed(2)} • {service.estimated_days}d
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* User Actions */}
                <div className="border-t pt-2 mt-2">
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start",
                          isActive('/dashboard') && "bg-accent"
                        )}
                        onClick={() => handleNavigation('/dashboard')}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start",
                          isActive('/profile') && "bg-accent"
                        )}
                        onClick={() => handleNavigation('/profile')}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Perfil
                      </Button>
                      <Button
                        onClick={handleStartChat}
                        className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow mt-2"
                      >
                        <MessageCircle className="h-4 w-4 mr-3" />
                        Novo Pedido
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/auth/login')}
                      >
                        <LogIn className="h-4 w-4 mr-3" />
                        Entrar
                      </Button>
                      <Button
                        onClick={handleStartChat}
                        className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow mt-2"
                      >
                        <MessageCircle className="h-4 w-4 mr-3" />
                        Falar com Assistente
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search Dialog */}
      <SearchDialog 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        services={popularServices}
        onServiceSelect={handleServiceSelect}
      />
    </>
  );
}