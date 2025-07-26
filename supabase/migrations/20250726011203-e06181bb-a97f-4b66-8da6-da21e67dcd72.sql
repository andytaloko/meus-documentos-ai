-- Add configuration variables needed for email notifications
-- These will be used by the trigger function to know the Supabase URL and service role key
ALTER DATABASE postgres SET app.supabase_url = 'https://lcsevtixfmcikjhnjobf.supabase.co';
ALTER DATABASE postgres SET app.supabase_service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjc2V2dGl4Zm1jaWtqaG5qb2JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ4NjI1OSwiZXhwIjoyMDY5MDYyMjU5fQ.XQwbpRdZWHj0-Z2hvbp-ynJGLCtDrfOV7CTAA0c1xFo';

-- Create trigger to send email notifications on order creation
CREATE OR REPLACE FUNCTION public.send_order_notification_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Send order confirmation email when order is created
  IF TG_OP = 'INSERT' THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-order-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'order_confirmation',
        'order_id', NEW.id::text,
        'customer_email', NEW.customer_email,
        'customer_name', NEW.customer_name
      )
    );
  END IF;

  -- Send payment confirmation email when payment status changes to paid
  IF TG_OP = 'UPDATE' AND OLD.payment_status != 'paid' AND NEW.payment_status = 'paid' THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-order-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'payment_confirmation',
        'order_id', NEW.id::text,
        'customer_email', NEW.customer_email,
        'customer_name', NEW.customer_name
      )
    );
  END IF;

  -- Send status update email when order status changes (except to processing after payment)
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status 
     AND NOT (OLD.status = 'pending' AND NEW.status = 'processing' AND NEW.payment_status = 'paid') THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-order-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'status_update',
        'order_id', NEW.id::text,
        'customer_email', NEW.customer_email,
        'customer_name', NEW.customer_name,
        'new_status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for email notifications
DROP TRIGGER IF EXISTS order_email_notifications ON public.orders;
CREATE TRIGGER order_email_notifications
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.send_order_notification_email();