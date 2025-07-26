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
    const { order_id } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // If payment is already confirmed, return current status
    if (order.payment_status === "paid") {
      return new Response(
        JSON.stringify({ 
          payment_status: "paid",
          order_status: order.status,
          order: order
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    let paymentStatus = order.payment_status;

    // Check Stripe session if it exists
    if (order.notes && order.notes.includes("Stripe Session:")) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2023-10-16",
      });

      const sessionId = order.notes.split("Stripe Session: ")[1];
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
          paymentStatus = "paid";
          
          // Update order status
          await supabase
            .from("orders")
            .update({ 
              payment_status: "paid",
              status: "processing",
              updated_at: new Date().toISOString()
            })
            .eq("id", order_id);
        }
      } catch (stripeError) {
        console.error("Error checking Stripe session:", stripeError);
      }
    }

    // For PIX payments, we would need to integrate with a real payment provider
    // to check the payment status. For now, we'll simulate manual confirmation.

    return new Response(
      JSON.stringify({ 
        payment_status: paymentStatus,
        order_status: paymentStatus === "paid" ? "processing" : order.status,
        order: {
          ...order,
          payment_status: paymentStatus,
          status: paymentStatus === "paid" ? "processing" : order.status
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});