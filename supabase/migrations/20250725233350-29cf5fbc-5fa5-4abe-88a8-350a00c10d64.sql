-- Criar tabela de serviços baseada na planilha
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  base_price INTEGER DEFAULT 0,
  estimated_days INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir os 6 serviços mapeados na planilha
INSERT INTO public.services (name, category, description, base_price, estimated_days) VALUES
('Certidão de Nascimento', 'Registro Civil', 'Solicitação de certidão de nascimento', 2500, 3),
('Certidão de Casamento', 'Registro Civil', 'Solicitação de certidão de casamento', 2500, 3),
('Certidão de Óbito', 'Registro Civil', 'Solicitação de certidão de óbito', 2500, 3),
('Reconhecimento de Firma', 'Tabelionato de Notas', 'Reconhecimento de firma por autenticidade', 1500, 1),
('Autenticação de Documentos', 'Tabelionato de Notas', 'Autenticação de cópias de documentos', 1000, 1),
('Procuração', 'Tabelionato de Notas', 'Elaboração de procuração pública', 5000, 2),
('Certidão de Matrícula', 'Registro de Imóveis', 'Certidão de matrícula de imóvel', 3500, 5),
('Certidão de Ônus', 'Registro de Imóveis', 'Certidão de ônus e gravames', 3000, 5),
('Transferência de Veículo', 'Veículos', 'Transferência de propriedade de veículo', 15000, 10),
('Licenciamento Anual', 'Veículos', 'Renovação de licenciamento veicular', 8000, 7),
('Certidão Simplificada', 'Juntas Comerciais', 'Certidão simplificada de empresa', 2000, 3),
('Ficha de Breve Relato', 'Juntas Comerciais', 'Ficha de breve relato empresarial', 1500, 2),
('Certidão de Antecedentes Criminais', 'Certidões Forenses', 'Certidão de antecedentes criminais', 1800, 7),
('Certidão de Distribuição', 'Certidões Forenses', 'Certidão de distribuição cível/criminal', 2200, 5);

-- Criar tabela de pedidos
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  service_id UUID REFERENCES public.services(id),
  status TEXT DEFAULT 'pending',
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_cpf TEXT,
  document_data JSONB,
  total_amount INTEGER,
  payment_status TEXT DEFAULT 'pending',
  estimated_completion_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de conversas do chatbot
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  current_step INTEGER DEFAULT 1,
  service_type TEXT,
  collected_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Políticas para serviços (público para leitura)
CREATE POLICY "Services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (true);

-- Políticas para pedidos
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (user_id = auth.uid() OR user_id IS NULL);

-- Políticas para conversas
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (user_id = auth.uid() OR user_id IS NULL);

-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para timestamp automático
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();