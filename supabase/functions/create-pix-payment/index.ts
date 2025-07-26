import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função para gerar código PIX simples (em produção, use uma API real como PagSeguro, Mercado Pago, etc.)
function generatePixCode(amount: number, recipientName: string, recipientCpf: string, description: string): string {
  // Este é um exemplo simplificado - em produção, use uma API de pagamento real
  const pixKey = "meisdocumentos@pix.com.br"; // Substitua pela chave PIX real
  const cityCode = "SAO PAULO";
  const merchantCategoryCode = "0000";
  
  // Formato básico do PIX QR Code (versão simplificada)
  const pixString = `00020101021226800014br.gov.bcb.pix2558${pixKey}5204${merchantCategoryCode}5303986540${amount.toFixed(2).replace('.', '')}5802BR5913${recipientName}6009${cityCode}62070503***6304`;
  
  return pixString;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, serviceId, customerData } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        service_id: serviceId,
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        customer_cpf: customerData.cpf,
        total_amount: amount,
        payment_status: "pending_pix",
        status: "pending",
        document_data: customerData.documentData || {},
        estimated_completion_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    // Generate PIX code
    const pixCode = generatePixCode(
      amount / 100, // Convert from centavos to reais
      "MEUS DOCUMENTOS AI",
      "12345678901", // Substitua pelo CPF/CNPJ real
      `Pagamento do pedido ${order.id}`
    );

    // Generate QR Code URL for PIX (using a simple QR code generator)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;

    // Update order with PIX details
    await supabase
      .from("orders")
      .update({ 
        notes: `PIX Code: ${pixCode}` 
      })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ 
        order_id: order.id,
        pix_code: pixCode,
        qr_code_url: qrCodeUrl,
        amount: amount / 100, // Return in reais
        expires_in: 30 * 60 // 30 minutes in seconds
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating PIX payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});