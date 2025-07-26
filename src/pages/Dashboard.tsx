import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Clock, CheckCircle, CreditCard, User, LogOut, Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string;
  total_amount: number;
  estimated_completion_date: string;
  created_at: string;
  services: {
    name: string;
    category: string;
  } | null;
}

interface Profile {
  display_name: string;
  phone: string;
  cpf: string;
}

const statusConfig = {
  pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
  processing: { label: 'Em Processamento', variant: 'default' as const, icon: FileText },
  completed: { label: 'Concluído', variant: 'default' as const, icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: Clock },
};

const paymentStatusConfig = {
  pending: { label: 'Pagamento Pendente', variant: 'secondary' as const },
  paid: { label: 'Pago', variant: 'default' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const },
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchUserData();
    setupRealtimeSubscription();
  }, [user, navigate]);

  // Filter orders based on search term and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.services?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const fetchUserData = async () => {
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          services (
            name,
            category
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do usuário.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            ));
            
            toast({
              title: 'Status Atualizado',
              description: 'O status do seu pedido foi atualizado.',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                Olá, {profile?.display_name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground">Acompanhe seus documentos e pedidos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'processing').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        {orders.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email, serviço ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="processing">Em processamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {searchTerm || statusFilter !== 'all' ? (
                <div className="text-sm text-muted-foreground">
                  {filteredOrders.length === 1 
                    ? `1 pedido encontrado` 
                    : `${filteredOrders.length} pedidos encontrados`
                  }
                  {searchTerm && ` para "${searchTerm}"`}
                  {statusFilter !== 'all' && ` com status "${statusFilter}"`}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Você ainda não tem pedidos.</p>
                <Button onClick={() => navigate('/')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Fazer Primeiro Pedido
                </Button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Seus pedidos aparecerão aqui'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="mt-4"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || FileText;
                  
                  return (
                    <div key={order.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{order.services?.name || 'Serviço'}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.services?.category}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={statusConfig[order.status as keyof typeof statusConfig]?.variant}>
                            {statusConfig[order.status as keyof typeof statusConfig]?.label}
                          </Badge>
                          <Badge variant={paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig]?.variant}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            {paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig]?.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valor</p>
                          <p className="font-medium">
                            R$ {(order.total_amount / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pedido em</p>
                          <p className="font-medium">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Previsão</p>
                          <p className="font-medium">
                            {order.estimated_completion_date 
                              ? new Date(order.estimated_completion_date).toLocaleDateString('pt-BR')
                              : 'A definir'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ID do Pedido</p>
                          <p className="font-medium text-xs">{order.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}