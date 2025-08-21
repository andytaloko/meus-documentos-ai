-- Add order_id column to conversations table for linking chats with orders
ALTER TABLE public.conversations
ADD COLUMN order_id UUID REFERENCES public.orders(id);

-- Add conversation_type enum for different chat flows
ALTER TABLE public.conversations
ADD COLUMN conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'order_specific', 'support'));

-- Add index for better performance on order-specific conversations
CREATE INDEX idx_conversations_order_id ON public.conversations(order_id);
CREATE INDEX idx_conversations_type_user ON public.conversations(conversation_type, user_id);

-- Update RLS policies to support order-specific conversations
CREATE POLICY "Users can view order-specific conversations" 
ON public.conversations 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  ((user_id IS NULL) AND (auth.uid() IS NULL)) OR
  (order_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = conversations.order_id 
    AND ((orders.user_id = auth.uid()) OR ((orders.user_id IS NULL) AND (auth.uid() IS NULL)))
  ))
);

-- Enable realtime for conversations table
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.conversations;