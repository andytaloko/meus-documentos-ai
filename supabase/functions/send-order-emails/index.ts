import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "order_confirmation" | "payment_confirmation" | "status_update";
  order_id: string;
  customer_email: string;
  customer_name: string;
  new_status?: string;
}

const getEmailTemplate = (type: string, data: any) => {
  switch (type) {
    case "order_confirmation":
      return {
        subject: "Seu pedido foi recebido - Confirmação",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Pedido Confirmado!</h1>
            <p>Olá ${data.customer_name},</p>
            <p>Recebemos seu pedido com sucesso. Aqui estão os detalhes:</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Número do Pedido:</strong> ${data.order_id}</p>
              <p><strong>Status:</strong> ${data.status}</p>
              <p><strong>Valor:</strong> R$ ${(data.total_amount / 100).toFixed(2)}</p>
            </div>
            <p>Você receberá atualizações sobre o andamento do seu pedido por email.</p>
            <p>Obrigado por escolher nossos serviços!</p>
          </div>
        `,
      };
    case "payment_confirmation":
      return {
        subject: "Pagamento Confirmado - Processamento Iniciado",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Pagamento Confirmado!</h1>
            <p>Olá ${data.customer_name},</p>
            <p>Seu pagamento foi processado com sucesso e já iniciamos o processamento do seu pedido.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p><strong>Número do Pedido:</strong> ${data.order_id}</p>
              <p><strong>Status:</strong> Em Processamento</p>
              <p><strong>Valor Pago:</strong> R$ ${(data.total_amount / 100).toFixed(2)}</p>
            </div>
            <p>Estimativa de conclusão: ${data.estimated_completion_date || 'Em breve'}</p>
            <p>Acompanhe o status do seu pedido em nosso dashboard.</p>
          </div>
        `,
      };
    case "status_update":
      return {
        subject: `Atualização do Pedido - ${data.new_status}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Status Atualizado</h1>
            <p>Olá ${data.customer_name},</p>
            <p>Temos uma atualização sobre seu pedido:</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Número do Pedido:</strong> ${data.order_id}</p>
              <p><strong>Novo Status:</strong> ${data.new_status}</p>
            </div>
            <p>Continue acompanhando o progresso em nosso dashboard.</p>
            <p>Obrigado por escolher nossos serviços!</p>
          </div>
        `,
      };
    default:
      throw new Error("Tipo de email não reconhecido");
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, order_id, customer_email, customer_name, new_status }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${customer_email} for order ${order_id}`);

    // Create Supabase client to fetch order details
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch order details
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (error || !order) {
      throw new Error(`Pedido não encontrado: ${error?.message}`);
    }

    // Prepare email data
    const emailData = {
      customer_name,
      order_id,
      status: order.status,
      total_amount: order.total_amount,
      estimated_completion_date: order.estimated_completion_date,
      new_status,
    };

    const template = getEmailTemplate(type, emailData);

    const emailResponse = await resend.emails.send({
      from: "DocFlow <noreply@resend.dev>",
      to: [customer_email],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, email_id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);