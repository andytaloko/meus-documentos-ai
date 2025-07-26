import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft, Search, MessageCircle } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { ActionButton } from "@/components/common/ActionButton";
import { QuickActions } from "@/components/common/QuickActions";
import { StatusBadge } from "@/components/common/StatusBadge";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, shouldUseModal } = useResponsiveLayout();
  const { warning } = useNotifications();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    warning('Página não encontrada', `A rota ${location.pathname} não existe`);
  }, [location.pathname, warning]);

  const quickActions = [
    {
      icon: Home,
      label: 'Página Inicial',
      onClick: () => navigate('/'),
      variant: 'default' as const
    },
    {
      icon: ArrowLeft,
      label: 'Voltar',
      onClick: () => navigate(-1),
      variant: 'outline' as const
    },
    {
      icon: Search,
      label: 'Buscar',
      onClick: () => navigate('/dashboard'),
      variant: 'outline' as const
    },
    {
      icon: MessageCircle,
      label: 'Suporte',
      onClick: () => window.open('https://wa.me/5511999999999?text=Olá, estou tendo problemas para acessar uma página', '_blank'),
      variant: 'outline' as const
    }
  ];

  const getSuggestions = () => {
    const path = location.pathname.toLowerCase();
    
    if (path.includes('dashboard')) return { text: 'Talvez você queira acessar o', link: '/dashboard', label: 'Dashboard' };
    if (path.includes('profile') || path.includes('perfil')) return { text: 'Talvez você queira acessar o', link: '/profile', label: 'Perfil' };
    if (path.includes('login') || path.includes('auth')) return { text: 'Talvez você queira fazer', link: '/auth/login', label: 'Login' };
    
    return { text: 'Que tal começar pela', link: '/', label: 'Página Inicial' };
  };

  const suggestion = getSuggestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className={`w-full max-w-lg ${isMobile ? 'px-2' : ''}`}>
        <Card className="animate-fade-in hover-scale">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-20 w-20 text-orange-500 animate-scale-in" />
            </div>
            <CardTitle className="text-4xl font-bold mb-2">404</CardTitle>
            <StatusBadge variant="destructive" className="mx-auto mb-4">
              Página não encontrada
            </StatusBadge>
            <p className="text-xl text-muted-foreground">
              Oops! A página que você procura não existe
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                A URL <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{location.pathname}</code> não foi encontrada em nosso sistema.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">
                  {suggestion.text}{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-semibold story-link"
                    onClick={() => navigate(suggestion.link)}
                  >
                    {suggestion.label}
                  </Button>
                </p>
              </div>
            </div>

            <QuickActions 
              actions={quickActions}
              variant={isMobile ? "mobile" : "grid"}
              className="mt-6"
            />

            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>
                Se você acredita que isso é um erro, entre em contato conosco pelo WhatsApp.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;