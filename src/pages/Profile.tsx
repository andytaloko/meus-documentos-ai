import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save, User, Loader2, Settings, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useNotifications } from '@/hooks/useNotifications';
import { StatusBadge } from '@/components/common/StatusBadge';
import { QuickActions } from '@/components/common/QuickActions';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { LoadingSkeleton } from '@/components/dashboard/LoadingSkeleton';

interface Profile {
  display_name: string;
  phone: string;
  cpf: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile>({
    display_name: '',
    phone: '',
    cpf: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile, shouldUseModal } = useResponsiveLayout();
  const { success, error: notifyError } = useNotifications();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile({
          display_name: data.display_name || '',
          phone: data.phone || '',
          cpf: data.cpf || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Erro ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          display_name: profile.display_name,
          phone: profile.phone,
          cpf: profile.cpf,
        });

      if (error) throw error;

      success('Perfil Atualizado', 'Suas informações foram salvas com sucesso');
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
      notifyError('Erro ao salvar', 'Não foi possível atualizar o perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const quickActions = [
    {
      icon: Save,
      label: 'Salvar',
      onClick: () => {
        const form = document.querySelector('form') as HTMLFormElement;
        form?.requestSubmit();
      },
      variant: 'default' as const,
      disabled: saving
    },
    {
      icon: Settings,
      label: 'Configurações',
      onClick: () => navigate('/settings'),
      variant: 'outline' as const
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-2xl">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover-scale"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Voltar ao Dashboard</span>
          </div>
          <NotificationCenter />
        </div>

        <Card className="animate-fade-in hover-scale">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Meu Perfil</CardTitle>
              </div>
              {saving && (
                <StatusBadge variant="secondary" className="text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Salvando...
                </StatusBadge>
              )}
            </div>
            {!isMobile && (
              <QuickActions 
                actions={quickActions}
                variant="compact"
                className="mt-4"
              />
            )}
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Nome Completo</Label>
                <Input
                  id="display_name"
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  value={profile.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving} className={`flex-1 hover-scale ${isMobile ? 'text-sm' : ''}`}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="hover-scale"
                >
                  Cancelar
                </Button>
              </div>
              
              {isMobile && (
                <QuickActions 
                  actions={quickActions}
                  variant="mobile"
                  className="mt-4"
                />
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}