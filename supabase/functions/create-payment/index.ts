import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = "brl", serviceId, customerData } = await req.json();
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create order in database first
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        service_id: serviceId,
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        customer_cpf: customerData.cpf,
        total_amount: amount,
        payment_status: "pending",
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

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: customerData.email,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Serviço de Documentos - ${customerData.serviceName || 'Documento'}`,
              description: `Processamento de documento para ${customerData.name}`,
            },
            unit_amount: amount, // amount in centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?order_id=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled?order_id=${order.id}`,
      metadata: {
        order_id: order.id,
        service_id: serviceId,
      },
    });

    // Update order with Stripe session ID
    await supabase
      .from("orders")
      .update({ 
        notes: `Stripe Session: ${session.id}` 
      })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        order_id: order.id,
        session_id: session.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});