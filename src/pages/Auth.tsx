import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useNotifications } from '@/hooks/useNotifications';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ProgressTracker } from '@/components/common/ProgressTracker';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, shouldUseModal } = useResponsiveLayout();
  const { success, error: notifyError } = useNotifications();
  
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      notifyError('Falha no login', 'Verifique suas credenciais');
    } else {
      success('Login realizado!', 'Bem-vindo de volta');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    const { error } = await signUp(email, password, displayName);
    
    if (error) {
      setError(error.message);
      notifyError('Erro no cadastro', 'Problema ao criar conta');
    } else {
      setMessage('Verifique seu email para confirmar sua conta.');
      success('Conta criada!', 'Verifique seu email');
    }
    setLoading(false);
  };

  const authSteps = [
    { id: 'choose', label: 'Escolher', completed: true },
    { id: 'fill', label: 'Preencher', completed: Boolean(activeTab !== 'signin' || (email && password)) },
    { id: 'access', label: 'Acessar', completed: false }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className={`w-full max-w-md space-y-6 animate-fade-in ${isMobile ? 'px-2' : ''}`}>
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="p-2 hover-scale"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Voltar</span>
        </div>
        
        <ProgressTracker steps={authSteps} className="mb-6" />

        <div className="text-center">
          <h1 className="text-2xl font-bold">MeusDocumentos.AI</h1>
          <p className="text-muted-foreground">Acesse sua conta ou crie uma nova</p>
        </div>

        <Card className="hover-scale">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4 mt-4">
                <CardTitle>Entrar</CardTitle>
                <CardDescription>
                  Entre com seu email e senha para acessar sua conta.
                </CardDescription>
                
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full hover-scale" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                  
                  {loading && (
                    <div className="flex items-center justify-center pt-2">
                      <StatusBadge variant="secondary" className="text-xs">
                        Autenticando...
                      </StatusBadge>
                    </div>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Crie uma conta para acompanhar seus pedidos e documentos.
                </CardDescription>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full hover-scale" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                  
                  {loading && (
                    <div className="flex items-center justify-center pt-2">
                      <StatusBadge variant="secondary" className="text-xs">
                        Configurando conta...
                      </StatusBadge>
                    </div>
                  )}
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}