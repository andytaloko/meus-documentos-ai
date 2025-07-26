import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validatePassword = (pass: string) => {
    return pass.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!validatePassword(password)) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    const { error: signUpError } = await signUp(email, password, displayName);
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (signUpError.message.includes('weak password')) {
        setError('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } else {
      setSuccess(true);
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao MeusDocumentos.AI",
      });
      
      // Auto redirect after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Conta criada!</h2>
              <p className="text-muted-foreground">
                Sua conta foi criada com sucesso. Redirecionando para o dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Voltar</span>
          </div>
          
          <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Crie sua conta para acompanhar seus documentos
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome (opcional)
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha *
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link 
                  to="/auth/login" 
                  className="font-medium text-primary hover:underline"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}